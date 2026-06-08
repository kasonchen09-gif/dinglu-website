/**
 * 后台管理系统 - Admin Panel JS
 */
(function () {
    'use strict';

    var API = '/api';
    var token = sessionStorage.getItem('admin_token');
    var data = null;
    var currentTab = 'tab-site';

    // ==================== Init ====================
    if (token) {
        checkAuth();
    }

    // ==================== Auth ====================
    window.doLogin = function () {
        var pw = document.getElementById('loginPassword').value;
        if (!pw) return;

        fetch(API + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pw })
        })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (res.success) {
                    token = res.token;
                    sessionStorage.setItem('admin_token', token);
                    document.getElementById('loginError').style.display = 'none';
                    document.getElementById('loginOverlay').classList.add('hidden');
                    document.getElementById('adminWrap').classList.add('active');
                    loadData();
                } else {
                    document.getElementById('loginError').style.display = 'block';
                }
            })
            .catch(function () {
                showToast('无法连接服务器，请检查网络', 'err');
            });
    };

    window.doLogout = function () {
        fetch(API + '/logout', {
            method: 'POST',
            headers: { 'x-auth-token': token }
        }).finally(function () {
            token = null;
            sessionStorage.removeItem('admin_token');
            location.reload();
        });
    };

    function checkAuth() {
        fetch(API + '/check-auth?token=' + token)
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (res.success) {
                    document.getElementById('loginOverlay').classList.add('hidden');
                    document.getElementById('adminWrap').classList.add('active');
                    loadData();
                } else {
                    token = null;
                    sessionStorage.removeItem('admin_token');
                }
            })
            .catch(function () {
                token = null;
                sessionStorage.removeItem('admin_token');
            });
    }

    // ==================== Load Data ====================
    function loadData() {
        fetch(API + '/data', { headers: { 'x-auth-token': token } })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (res.success) {
                    data = res.data;
                    initSidebar();
                    switchTab(currentTab);
                }
            })
            .catch(function () {
                showToast('加载数据失败', 'err');
            });
    }

    // ==================== Sidebar ====================
    function initSidebar() {
        var links = document.querySelectorAll('#sidebarNav a');
        links.forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                currentTab = this.getAttribute('data-tab');
                switchTab(currentTab);
                links.forEach(function (l) { l.classList.remove('active'); });
                this.classList.add('active');
            });
        });
    }

    function switchTab(tab) {
        var main = document.getElementById('mainContent');
        switch (tab) {
            case 'tab-site': renderSite(main); break;
            case 'tab-hero': renderHero(main); break;
            case 'tab-about': renderAbout(main); break;
            case 'tab-business': renderBusiness(main); break;
            case 'tab-news': renderNews(main); break;
            case 'tab-clients': renderClients(main); break;
            case 'tab-contact': renderContact(main); break;
            case 'tab-footer': renderFooter(main); break;
            case 'tab-password': renderPassword(main); break;
        }
    }

    // ==================== Section Renderers ====================

    function renderSite(el) {
        var s = data.site || {};
        el.innerHTML =
            '<h1>🌐 网站设置</h1>' +
            '<div class="card"><h3>基本信息</h3>' +
            formGroup('网站标题 (title)', 'site_title', s.title || '') +
            formGroup('SEO描述 (description)', 'site_description', s.description || '', 'textarea') +
            formGroup('SEO关键词 (逗号分隔)', 'site_keywords', s.keywords || '') +
            formGroup('公司简称', 'site_companyNameShort', s.companyNameShort || '') +
            '</div>' +
            '<div class="card"><h3>网站 Logo</h3>' +
            '<div class="img-upload">' +
            '<img src="' + (s.logo || 'images/信霖咨询-logo.png') + '" alt="Logo" id="preview_logo" onerror="this.style.display=\'none\'">' +
            '<input type="file" id="file_logo" accept="image/*" onchange="uploadLogo()">' +
            '<button class="btn-sm" onclick="uploadLogo()">更换Logo</button>' +
            '<span style="font-size:12px;color:#999">推荐高度 50-60px 的长条型PNG图片</span>' +
            '</div>' +
            '</div>' +
            saveBtn('site');
    }

    function renderHero(el) {
        var slides = data.hero ? data.hero.slides : [];
        var html = '<h1>🎠 首页轮播图</h1>';
        for (var i = 0; i < slides.length; i++) {
            var slide = slides[i];
            html +=
                '<div class="card"><h3>轮播图 ' + (i + 1) + '</h3>' +
                formGroup('标签文字', 'hero_slide_' + i + '_tag', slide.tag || '') +
                formGroup('标题 (可含HTML标签如&lt;span&gt;)', 'hero_slide_' + i + '_title', slide.title || '') +
                formGroup('描述文字', 'hero_slide_' + i + '_desc', slide.desc || '', 'textarea') +
                formGroup('按钮1文字', 'hero_slide_' + i + '_btn1Text', slide.btn1Text || '') +
                formGroup('按钮2文字', 'hero_slide_' + i + '_btn2Text', slide.btn2Text || '') +
                '</div>';
        }
        html += saveBtn('hero');
        el.innerHTML = html;
    }

    function renderAbout(el) {
        var a = data.about || {};
        var stats = a.stats || [];
        var html = '<h1>📋 关于我们</h1>' +
            '<div class="card"><h3>公司介绍</h3>' +
            formGroup('第一段介绍', 'about_text1', a.text1 || '', 'textarea') +
            formGroup('第二段介绍', 'about_text2', a.text2 || '', 'textarea') +
            formGroup('第三段介绍', 'about_text3', a.text3 || '', 'textarea') +
            '</div>' +
            '<div class="card"><h3>统计数据</h3>';
        for (var i = 0; i < stats.length; i++) {
            html += '<div class="form-row">' +
                formGroup('数字 (纯数字，不加+)', 'about_stat_' + i + '_number', String(stats[i].number || '')) +
                formGroup('后缀 (如 +, %, 等)', 'about_stat_' + i + '_suffix', stats[i].suffix || '') +
                formGroup('标签文字', 'about_stat_' + i + '_label', stats[i].label || '') +
                '</div>';
        }
        html += '</div>' + saveBtn('about');
        el.innerHTML = html;
    }

    function renderBusiness(el) {
        var cards = data.businessCards || [];
        var icons = [
            'fa-hard-hat', 'fa-user-tie', 'fa-calculator', 'fa-graduation-cap',
            'fa-certificate', 'fa-lightbulb', 'fa-registered', 'fa-rocket',
            'fa-clipboard-check', 'fa-microchip'
        ];
        var html = '<h1>💼 业务范围</h1>';
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var iconSelect = '';
            icons.forEach(function (ic) {
                iconSelect += '<option value="' + ic + '"' + (card.icon === ic ? ' selected' : '') + '>' + ic + '</option>';
            });
            html +=
                '<div class="card"><h3>业务卡片 ' + (i + 1) + '</h3>' +
                '<div class="form-row">' +
                formGroup('FA图标名称', 'biz_' + i + '_icon', card.icon || '', 'select', iconSelect) +
                formGroup('标题', 'biz_' + i + '_title', card.title || '') +
                '</div>' +
                formGroup('描述', 'biz_' + i + '_desc', card.desc || '', 'textarea') +
                '</div>';
        }
        html += saveBtn('business');
        el.innerHTML = html;
    }

    function renderNews(el) {
        var news = data.news || [];
        var html = '<h1>📰 新闻动态</h1>';
        for (var i = 0; i < news.length; i++) {
            var n = news[i];
            html +=
                '<div class="card"><h3>新闻 ' + (i + 1) + '</h3>' +
                '<div class="form-row">' +
                formGroup('唯一ID（URL标识，如 zizhi-gaige-2026）', 'news_' + i + '_id', n.id || '') +
                formGroup('分类标签', 'news_' + i + '_category', n.category || '') +
                '</div>' +
                '<div class="img-upload" style="margin-bottom:12px">' +
                '<img src="' + (n.image || '') + '" id="preview_news_' + i + '" onerror="this.style.display=\'none\'">' +
                '<input type="file" id="file_news_' + i + '" accept="image/*" onchange="uploadNewsImg(' + i + ')">' +
                '<button class="btn-sm" onclick="uploadNewsImg(' + i + ')">上传封面图</button>' +
                '</div>' +
                '<div class="form-row">' +
                formGroup('日期-日', 'news_' + i + '_dateDay', n.dateDay || '') +
                formGroup('日期-年月 (如2026.05)', 'news_' + i + '_dateMonth', n.dateMonth || '') +
                '</div>' +
                formGroup('标题', 'news_' + i + '_title', n.title || '') +
                formGroup('摘要（显示在首页卡片）', 'news_' + i + '_excerpt', n.excerpt || '', 'textarea') +
                formGroup('正文内容（支持HTML标签：&lt;p&gt;&lt;h3&gt;&lt;strong&gt;等）', 'news_' + i + '_content', n.content || '', 'textarea') +
                '</div>';
        }
        html += saveBtn('news');
        el.innerHTML = html;
    }

    function renderClients(el) {
        var clients = data.clients || [];
        var html = '<h1>🤝 合作客户</h1>' +
            '<div class="card"><h3>客户Logo列表</h3>' +
            '<div class="client-grid-admin">';
        for (var i = 0; i < clients.length; i++) {
            var c = clients[i];
            html +=
                '<div class="client-admin-card">' +
                '<img src="' + (c.image || '') + '" onerror="this.style.display=\'none\'">' +
                '<input type="file" id="file_client_' + i + '" accept="image/*" onchange="uploadClientImg(' + i + ')" style="font-size:11px">' +
                '<input placeholder="客户名称" value="' + (c.name || '') + '" id="client_' + i + '_name">' +
                '<input placeholder="图片URL" value="' + (c.image || '') + '" id="client_' + i + '_image">' +
                '<div class="actions">' +
                '<button onclick="uploadClientImg(' + i + ')" style="color:#27ae60">上传图片</button>' +
                '<button onclick="delClient(' + i + ')" style="color:#e74c3c">删除</button>' +
                '</div>' +
                '</div>';
        }
        html += '</div>' +
            '<button class="btn-add" onclick="addClient()"><i class="fa-solid fa-plus"></i> 添加客户</button>' +
            '</div>' + saveBtn('clients');
        el.innerHTML = html;
    }

    function renderContact(el) {
        var c = data.contact || {};
        el.innerHTML =
            '<h1>📞 联系方式</h1>' +
            '<div class="card"><h3>联系信息</h3>' +
            '<div class="form-row">' +
            formGroup('电话1', 'contact_phone1', c.phone1 || '') +
            formGroup('电话2', 'contact_phone2', c.phone2 || '') +
            '</div>' +
            formGroup('公司地址', 'contact_address', c.address || '') +
            '<div class="form-row">' +
            formGroup('电子邮箱', 'contact_email', c.email || '') +
            formGroup('工作时间', 'contact_workHours', c.workHours || '') +
            '</div>' +
            '</div>' + saveBtn('contact');
    }

    function renderFooter(el) {
        var f = data.footer || {};
        el.innerHTML =
            '<h1>📌 页脚设置</h1>' +
            '<div class="card"><h3>页脚信息</h3>' +
            formGroup('公司简介文字', 'footer_about', f.about || '', 'textarea') +
            formGroup('版权信息', 'footer_copyright', f.copyright || '') +
            '<div class="form-row">' +
            formGroup('ICP备案号', 'footer_icp', f.icp || '') +
            formGroup('公安备案号', 'footer_beian', f.beian || '') +
            '</div>' +
            '</div>' + saveBtn('footer');
    }

    function renderPassword(el) {
        el.innerHTML =
            '<h1>🔒 修改密码</h1>' +
            '<div class="card"><h3>修改管理员密码</h3>' +
            '<div class="form-group"><label>原密码</label><input type="password" id="pw_old" placeholder="请输入原密码"></div>' +
            '<div class="form-group"><label>新密码（至少6位）</label><input type="password" id="pw_new" placeholder="请输入新密码"></div>' +
            '<div class="form-group"><label>确认新密码</label><input type="password" id="pw_new2" placeholder="请再次输入新密码"></div>' +
            '<button class="btn-save" onclick="changePassword()"><i class="fa-solid fa-key"></i> 修改密码</button>' +
            '</div>';
    }

    // ==================== Form Helpers ====================
    function formGroup(label, id, value, type, extra) {
        type = type || 'text';
        var input;
        if (type === 'textarea') {
            input = '<textarea id="' + id + '" rows="3">' + escapeHtml(value) + '</textarea>';
        } else if (type === 'select') {
            input = '<select id="' + id + '">' + extra + '</select>';
        } else {
            input = '<input type="' + type + '" id="' + id + '" value="' + escapeHtml(value) + '">';
        }
        return '<div class="form-group"><label>' + label + '</label>' + input + '</div>';
    }

    function saveBtn(section) {
        return '<div style="text-align:right;margin-top:20px">' +
            '<button class="btn-save" onclick="saveSection(\'' + section + '\')">' +
            '<i class="fa-solid fa-floppy-disk"></i> 保存修改</button></div>';
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ==================== Save ====================
    window.saveSection = function (section) {
        var patch = {};
        switch (section) {
            case 'site':
                patch.site = {
                    title: val('site_title'),
                    description: val('site_description'),
                    keywords: val('site_keywords'),
                    companyNameShort: val('site_companyNameShort'),
                };
                break;
            case 'hero':
                var slides = [];
                for (var i = 0; i < 3; i++) {
                    slides.push({
                        tag: val('hero_slide_' + i + '_tag'),
                        title: val('hero_slide_' + i + '_title'),
                        desc: val('hero_slide_' + i + '_desc'),
                        btn1Text: val('hero_slide_' + i + '_btn1Text'),
                        btn2Text: val('hero_slide_' + i + '_btn2Text'),
                    });
                }
                patch.hero = { slides: slides };
                break;
            case 'about':
                var stats = data.about.stats || [];
                var newStats = [];
                for (var j = 0; j < stats.length; j++) {
                    newStats.push({
                        number: parseInt(val('about_stat_' + j + '_number')) || 0,
                        suffix: val('about_stat_' + j + '_suffix'),
                        label: val('about_stat_' + j + '_label'),
                    });
                }
                patch.about = {
                    text1: val('about_text1'),
                    text2: val('about_text2'),
                    text3: val('about_text3'),
                    stats: newStats,
                };
                break;
            case 'business':
                var cards = data.businessCards || [];
                var newCards = [];
                for (var k = 0; k < cards.length; k++) {
                    newCards.push({
                        icon: val('biz_' + k + '_icon'),
                        title: val('biz_' + k + '_title'),
                        desc: val('biz_' + k + '_desc'),
                        highlight: cards[k].highlight,
                    });
                }
                patch.businessCards = newCards;
                break;
            case 'news':
                var newsArr = data.news || [];
                var newNews = [];
                for (var n = 0; n < newsArr.length; n++) {
                    newNews.push({
                        id: val('news_' + n + '_id'),
                        dateDay: val('news_' + n + '_dateDay'),
                        dateMonth: val('news_' + n + '_dateMonth'),
                        category: val('news_' + n + '_category'),
                        title: val('news_' + n + '_title'),
                        excerpt: val('news_' + n + '_excerpt'),
                        content: val('news_' + n + '_content'),
                        image: newsArr[n].image,
                    });
                }
                patch.news = newNews;
                break;
            case 'clients':
                var clientsArr = [];
                var count = data.clients ? data.clients.length : 0;
                for (var c = 0; c < count; c++) {
                    clientsArr.push({
                        name: val('client_' + c + '_name'),
                        image: val('client_' + c + '_image'),
                    });
                }
                patch.clients = clientsArr;
                break;
            case 'contact':
                patch.contact = {
                    phone1: val('contact_phone1'),
                    phone2: val('contact_phone2'),
                    address: val('contact_address'),
                    email: val('contact_email'),
                    workHours: val('contact_workHours'),
                };
                break;
            case 'footer':
                patch.footer = Object.assign({}, data.footer, {
                    about: val('footer_about'),
                    copyright: val('footer_copyright'),
                    icp: val('footer_icp'),
                    beian: val('footer_beian'),
                });
                break;
        }

        // Merge site.companyName from companyNameShort
        if (patch.site && patch.site.companyNameShort) {
            patch.site.companyName = patch.site.companyNameShort;
        }

        var btn = document.querySelector('.btn-save');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 保存中...'; }

        fetch(API + '/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify(patch),
        })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (res.success) {
                    showToast('✅ 保存成功！前台页面已自动更新', 'ok');
                    loadData(); // Reload
                } else {
                    showToast('保存失败：' + res.message, 'err');
                }
                if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 保存修改'; }
            })
            .catch(function (err) {
                showToast('保存失败，请检查网络连接', 'err');
                if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 保存修改'; }
            });
    };

    // ==================== Image Uploads ====================
    window.uploadLogo = function () {
        var fileInput = document.getElementById('file_logo');
        var file = fileInput.files[0];
        if (!file) { showToast('请先选择图片文件', 'err'); return; }
        uploadFile(file, 'logo', function (url) {
            var preview = document.getElementById('preview_logo');
            if (preview) { preview.src = url; preview.style.display = ''; }
            showToast('Logo更换成功！', 'ok');
        });
    };

    window.uploadNewsImg = function (index) {
        var fileInput = document.getElementById('file_news_' + index);
        var file = fileInput ? fileInput.files[0] : null;
        if (!file) { showToast('请先选择图片文件', 'err'); return; }
        uploadFile(file, 'image', function (url) {
            var preview = document.getElementById('preview_news_' + index);
            if (preview) { preview.src = url; preview.style.display = ''; }
            // Also update data
            if (data.news && data.news[index]) {
                data.news[index].image = url;
            }
            showToast('新闻封面图上传成功！', 'ok');
        });
    };

    window.uploadClientImg = function (index) {
        var fileInput = document.getElementById('file_client_' + index);
        var file = fileInput ? fileInput.files[0] : null;
        if (!file) { showToast('请先选择图片文件', 'err'); return; }
        uploadFile(file, 'image', function (url) {
            var imgTag = document.querySelectorAll('.client-admin-card img')[index];
            if (imgTag) { imgTag.src = url; imgTag.style.display = ''; }
            var urlInput = document.getElementById('client_' + index + '_image');
            if (urlInput) { urlInput.value = url; }
            if (data.clients && data.clients[index]) {
                data.clients[index].image = url;
            }
            showToast('客户Logo上传成功！记得点保存按钮保存修改', 'ok');
        });
    };

    function uploadFile(file, fieldName, callback) {
        var formData = new FormData();
        formData.append(fieldName, file);

        fetch(API + '/upload' + (fieldName === 'logo' ? '-logo' : ''), {
            method: 'POST',
            headers: { 'x-auth-token': token },
            body: formData,
        })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (res.success) {
                    callback(res.url);
                } else {
                    showToast('上传失败：' + res.message, 'err');
                }
            })
            .catch(function () {
                showToast('上传失败，请检查网络', 'err');
            });
    }

    // ==================== Client Management ====================
    window.addClient = function () {
        if (!data.clients) data.clients = [];
        data.clients.push({ image: '', name: '新客户' });
        renderClients(document.getElementById('mainContent'));
    };

    window.delClient = function (index) {
        if (!confirm('确定要删除这个客户吗？')) return;
        if (data.clients) {
            data.clients.splice(index, 1);
        }
        renderClients(document.getElementById('mainContent'));
    };

    // ==================== Change Password ====================
    window.changePassword = function () {
        var oldPw = document.getElementById('pw_old').value;
        var newPw = document.getElementById('pw_new').value;
        var newPw2 = document.getElementById('pw_new2').value;

        if (!oldPw || !newPw) { showToast('请填写完整', 'err'); return; }
        if (newPw !== newPw2) { showToast('两次新密码输入不一致', 'err'); return; }
        if (newPw.length < 6) { showToast('新密码不能少于6位', 'err'); return; }

        fetch(API + '/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
        })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (res.success) {
                    showToast('密码修改成功！', 'ok');
                    document.getElementById('pw_old').value = '';
                    document.getElementById('pw_new').value = '';
                    document.getElementById('pw_new2').value = '';
                } else {
                    showToast(res.message, 'err');
                }
            });
    };

    // ==================== Toast ====================
    function showToast(msg, type) {
        var toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = 'toast ' + (type || 'ok') + ' show';
        clearTimeout(toast._t);
        toast._t = setTimeout(function () {
            toast.classList.remove('show');
        }, 3000);
    }

    // ==================== Utility ====================
    function val(id) {
        var el = document.getElementById(id);
        return el ? el.value : '';
    }
})();
