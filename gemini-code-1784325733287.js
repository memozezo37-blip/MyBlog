document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const blogContainer = document.getElementById('blog-container');
    const categoryLinks = document.querySelectorAll('nav a');

    // إدارة الوضع الداكن/الفاتح
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerText = '☀️ إضاءة فاتحة';
    }

    themeToggleBtn.addEventListener('click', () => {
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerText = '🌙 إضاءة داكنة';
        } else {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerText = '☀️ إضاءة فاتحة';
        }
    });

    // جلب المقالات وعرضها
    let postsData = [];

    fetch('posts.json')
        .then(response => response.json())
        .then(posts => {
            postsData = posts;
            renderPosts(posts);
        })
        .catch(error => {
            blogContainer.innerHTML = '<p>حدث خطأ في تحميل المقالات. تأكد من صحة ملف posts.json</p>';
        });

    function renderPosts(posts) {
        blogContainer.innerHTML = '';
        posts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post-card';
            article.innerHTML = `
                <h2>${post.title}</h2>
                <div class="post-meta">${post.date} | ${post.category_ar}</div>
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
            `;
            blogContainer.appendChild(article);
        });
    }

    // فلترة المقالات حسب القسم
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = e.target.getAttribute('data-filter');
            
            if (filter === 'all') {
                renderPosts(postsData);
            } else {
                const filtered = postsData.filter(post => post.category_en === filter);
                renderPosts(filtered);
            }
        });
    });
});