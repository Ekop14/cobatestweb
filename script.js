// ==========================================
// 2. AI ASSISTANT (DENGAN MEMORI & FUNCTION CALLING)
// ==========================================
function initAiAssistant() {
    const modal = document.getElementById('aiChatModal');
    const panel = document.getElementById('aiChatPanel');
    const overlay = document.getElementById('aiChatOverlay');
    const closeBtn = document.getElementById('closeAiChat');
    const input = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiChatSend');
    const messagesContainer = document.getElementById('aiChatMessages');
    
    // ✅ HANYA DEKLARASI 'aiBtn' SEKALI DI SINI (Mendeteksi Floating Btn atau Sidebar Btn)
    const aiBtn = document.getElementById('aiFloatingBtn') || document.getElementById('aiAssistantBtn');

    if (!modal || !aiBtn) {
        console.warn("⚠️ Elemen AI Chat atau Tombol AI tidak ditemukan di HTML.");
        return;
    }

    let chatHistory = []; 

    aiBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        setTimeout(() => panel.classList.remove('translate-x-full'), 10);
        input.focus();
    });

    function closeModal() {
        panel.classList.add('translate-x-full');
        setTimeout(() => { 
            modal.classList.add('hidden');
            chatHistory = []; // Reset memori saat modal ditutup
        }, 300);
    }
    
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    document.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', () => {
            input.value = btn.textContent.replace(/^[^\s]+\s/, '').trim();
            handleAiSend();
        });
    });

    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAiSend(); });
    sendBtn?.addEventListener('click', handleAiSend);

    async function handleAiSend() {
        const question = input.value.trim();
        if (!question) return;

        addMessage(question, 'user');
        input.value = '';
        sendBtn.disabled = true;
        const typingId = addTypingIndicator();

        try {
            const context = await getFullSupabaseContext();
            chatHistory.push({ role: 'user', content: question });
            const answer = await getGroqResponse(chatHistory, context);
            removeTypingIndicator(typingId);
            addMessage(answer, 'ai');
            chatHistory.push({ role: 'assistant', content: answer });
        } catch (error) {
            removeTypingIndicator(typingId);
            addMessage('Maaf, terjadi kesalahan: ' + error.message, 'ai', true);
        } finally {
            sendBtn.disabled = false;
        }
    }

    function addMessage(text, sender, isError = false) {
        const div = document.createElement('div');
        div.className = 'flex gap-3 ' + (sender === 'user' ? 'flex-row-reverse' : '');
        const avatar = sender === 'user' 
            ? `<div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>`
            : `<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg></div>`;
        const bubbleClass = sender === 'user' ? 'bg-blue-500/20 border border-blue-500/30 rounded-2xl rounded-tr-none' : (isError ? 'bg-red-500/20 border border-red-500/30 rounded-2xl rounded-tl-none' : 'bg-white/5 border border-white/10 rounded-2xl rounded-tl-none');
        div.innerHTML = `${avatar}<div class="flex-1 ${bubbleClass} p-4"><p class="text-white text-sm whitespace-pre-wrap">${text}</p></div>`;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex gap-3';
        div.innerHTML = `<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg></div><div class="flex-1 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4"><div class="flex gap-1"><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 0ms"></div><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 150ms"></div><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 300ms"></div></div></div>`;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) { 
        const el = document.getElementById(id); 
        if (el) el.remove(); 
    }

    async function executeDeleteSubmission(submissionId, reason) {
        const supabase = window.supabaseClient;
        try {
            const isConfirmed = confirm(`⚠️ KONFIRMASI KEAMANAN\n\nAI meminta izin untuk MENGHAPUS data submission.\nID: ${submissionId}\nAlasan: ${reason}\n\nApakah Anda yakin ingin melanjutkan?`);
            if (!isConfirmed) return "Penghapusan dibatalkan oleh pengguna.";

            const { data, error } = await supabase.from('checklist_submissions').delete().eq('id', submissionId).select();
            if (error) throw error;
            return `Berhasil! Data dengan ID ${submissionId} telah dihapus dari database.`;
        } catch (error) {
            return `Gagal menghapus data: ${error.message}`;
        }
    }

    async function getFullSupabaseContext() {
        const supabase = window.supabaseClient;
        if (!supabase) return "Tidak ada koneksi database.";
        
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const todayStr = today.toISOString().split('T')[0];
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const { count: todayCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', todayStr + 'T00:00:00');
            const { count: totalCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true });
            const { count: completedCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).eq('status', 'completed');
            const { count: yesterdayCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayStr + 'T00:00:00').lte('created_at', yesterdayStr + 'T23:59:59');
            const { data: yesterdayDetails } = await supabase.from('checklist_submissions').select('id, user_name, progress_percentage, status, created_at, submission_time').gte('created_at', yesterdayStr + 'T00:00:00').lte('created_at', yesterdayStr + 'T23:59:59');
            
            let yesterdayAvg = 0;
            if (yesterdayDetails && yesterdayDetails.length > 0) {
                const sum = yesterdayDetails.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0);
                yesterdayAvg = Math.round(sum / yesterdayDetails.length);
            }
            const { data: allSubmissions } = await supabase.from('checklist_submissions').select('progress_percentage');
            let avgProgress = 0;
            if (allSubmissions && allSubmissions.length > 0) {
                const sum = allSubmissions.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0);
                avgProgress = Math.round(sum / allSubmissions.length);
            }
            const { data: recent } = await supabase.from('checklist_submissions').select('id, user_name, progress_percentage, status, created_at, submission_time').order('created_at', { ascending: false }).limit(5);

            const currentUserEmail = window.currentUser?.email || '';
            const { data: myTodaySubmission, error: myError } = await supabase.from('checklist_submissions').select('id, user_name, progress_percentage, status, submission_time, created_at').eq('user_email', currentUserEmail).gte('created_at', todayStr + 'T00:00:00').lte('created_at', todayStr + 'T23:59:59').order('created_at', { ascending: false }).limit(1);

            let hasSubmittedToday = false;
            let mySubmissionInfo = "User belum submit checklist hari ini.";
            if (!myError && myTodaySubmission && myTodaySubmission.length > 0) {
                hasSubmittedToday = true;
                const sub = myTodaySubmission[0];
                mySubmissionInfo = `✅ User ${sub.user_name || currentUserEmail} SUDAH submit checklist hari ini (${todayStr}) pada pukul ${sub.submission_time || new Date(sub.created_at).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} dengan progress ${sub.progress_percentage}% dan status "${sub.status}". ID Submission: ${sub.id}`;
            }

            const { data: myYesterdaySubmission } = await supabase.from('checklist_submissions').select('id, user_name, progress_percentage, status, submission_time, created_at').eq('user_email', currentUserEmail).gte('created_at', yesterdayStr + 'T00:00:00').lte('created_at', yesterdayStr + 'T23:59:59').order('created_at', { ascending: false }).limit(1);
            let myYesterdayInfo = "User tidak ada submission kemarin.";
            if (myYesterdaySubmission && myYesterdaySubmission.length > 0) {
                const sub = myYesterdaySubmission[0];
                myYesterdayInfo = `Submission user kemarin (${yesterdayStr}): ID ${sub.id}, progress ${sub.progress_percentage}%, status "${sub.status}", jam ${sub.submission_time || '-'}.`;
            }

            return JSON.stringify({
                today_submissions: todayCount || 0, total_submissions: totalCount || 0, average_progress: avgProgress + '%', completed_submissions: completedCount || 0, recent_activity: recent || [],
                yesterday_date_str: yesterday.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), yesterday_submissions_count: yesterdayCount || 0, yesterday_avg_progress: yesterdayAvg + '%', yesterday_details: yesterdayDetails || [],
                current_user: window.currentUser?.name || 'User', current_user_email: currentUserEmail, current_date: today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                has_submitted_today: hasSubmittedToday, my_today_submission: mySubmissionInfo, my_yesterday_submission: myYesterdayInfo
            }, null, 2);
        } catch (error) {
            return 'Error mengambil data: ' + error.message;
        }
    }

    async function getGroqResponse(history, context) {
        if (!GROQ_API_KEY || GROQ_API_KEY === 'gsk_API_KEY_ANDA_DISINI') {
            return "⚠️ API Key Groq belum diatur di config.js.";
        }
        
        const systemPrompt = `Anda adalah AI Assistant cerdas untuk sistem "Gudang Clean". Jawab dalam bahasa Indonesia yang ramah, profesional, dan gunakan emoji. Maksimal 150 kata.
ATURAN PENTING:
1. Gunakan DATA KONTEKS di bawah ini untuk menjawab. JANGAN mengarang angka.
2. Ingat percakapan sebelumnya dengan user. Jika user bertanya "kenapa?" atau "maksudnya?", lihat pesan user sebelumnya di riwayat chat.
3. Jika pengguna meminta untuk menghapus data, gunakan tool 'delete_submission'.
4. Untuk pertanyaan "sudah submit hari ini?", cek field "has_submitted_today" dan "my_today_submission".
5. Jika ditanya "kemarin" atau "H-1", gunakan data "yesterday_..." dan "my_yesterday_submission".

DATA KONTEKS DATABASE (JSON):
${context}`;

        const tools = [
            {
                type: "function",
                function: {
                    name: "delete_submission",
                    description: "Menghapus entri submission dari database berdasarkan ID. Gunakan HANYA jika pengguna secara eksplisit meminta penghapusan dan ID submission diketahui dari konteks.",
                    parameters: {
                        type: "object",
                        properties: {
                            submission_id: { type: "string", description: "UUID atau ID dari data submission yang akan dihapus" },
                            reason: { type: "string", description: "Alasan penghapusan yang diberikan pengguna" }
                        },
                        required: ["submission_id", "reason"]
                    }
                }
            }
        ];

        try {
            const messagesPayload = [
                { role: 'system', content: systemPrompt },
                ...history
            ];

            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    model: GROQ_MODEL, 
                    messages: messagesPayload, 
                    tools: tools,
                    tool_choice: "auto"
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${err.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            const message = data.choices[0].message;

            if (message.tool_calls && message.tool_calls.length > 0) {
                const toolCall = message.tool_calls[0];
                history.push(message); 

                if (toolCall.function.name === "delete_submission") {
                    const args = JSON.parse(toolCall.function.arguments);
                    const executionResult = await executeDeleteSubmission(args.submission_id, args.reason);
                    
                    history.push({ 
                        role: "tool", 
                        tool_call_id: toolCall.id,
                        content: executionResult 
                    });

                    const finalResponse = await fetch(GROQ_API_URL, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: GROQ_MODEL,
                            messages: [
                                { role: 'system', content: systemPrompt },
                                ...history
                            ]
                        })
                    });
                    
                    const finalData = await finalResponse.json();
                    return finalData.choices[0].message.content;
                }
            }

            return message.content;

        } catch (error) {
            throw new Error('Gagal menghubungi AI: ' + error.message);
        }
    }
}
