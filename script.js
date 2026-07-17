document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    // التحقق من الإعداد السابق للمستخدم
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // تبديل الوضع عند الضغط على الزر
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        let theme = 'light';
        if (document.body.classList.contains('dark-mode')) {
            theme = 'dark';
        }
        
        // حفظ الإعداد في المتصفح
        localStorage.setItem('theme', theme);
    });
});