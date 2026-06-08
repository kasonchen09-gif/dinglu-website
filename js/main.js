/**
 * 福州信霖管理咨询有限公司 - 主脚本
 * Main JavaScript for Dinglu Technology Website
 */

document.addEventListener('DOMContentLoaded', function () {
    // ==================== Loader ====================
    initLoader();

    // ==================== AOS Animation ====================
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 80,
        disable: false,
    });

    // ==================== Load Dynamic Content ====================
    loadContent();

    // ==================== Swiper Carousel ====================
    var heroSwiper = new Swiper('.heroSwiper', {
        loop: true,
        speed: 800,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true,
        },
    });

    // ==================== Header Scroll Effect ====================
    var header = document.getElementById('header');
    var backToTop = document.getElementById('backToTop');
    var scrollThreshold = 80;

    function handleScroll() {
        var scrollY = window.scrollY || window.pageYOffset;

        if (scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        if (backToTop) {
            if (scrollY > 500) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ==================== Back to Top ====================
    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==================== Mobile Menu ====================
    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('navMenu');
    var navLinks = document.querySelectorAll('.nav-link');
    var body = document.body;

    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        body.style.overflow = '';
    }

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMenu);

        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                closeMenu();
            });
        });

        document.addEventListener('click', function (e) {
            if (
                navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !hamburger.contains(e.target)
            ) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // ==================== Active Nav Link on Scroll ====================
    var sections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        var scrollY = window.scrollY || window.pageYOffset;
        var windowHeight = window.innerHeight;
        var currentSection = 'home';

        sections.forEach(function (section) {
            var sectionTop = section.offsetTop - 100;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = sectionId;
            }
        });

        var docHeight = document.documentElement.scrollHeight;
        if (scrollY + windowHeight >= docHeight - 50) {
            currentSection = 'contact';
        }

        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === currentSection) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // ==================== Smooth Scroll for Nav Links ====================
    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var targetId = this.getAttribute('href').substring(1);
            var target = document.getElementById(targetId);

            if (target) {
                var headerHeight = header.offsetHeight;
                var targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth',
                });
            }
        });
    });

    // ==================== Counter Animation ====================
    function initCounterAnimation() {
        var counters = document.querySelectorAll('.counter');
        var aboutSection = document.getElementById('about');
        var counterAnimated = false;

        if (!aboutSection) return;

        function animateCounters() {
            if (counterAnimated) return;

            counters.forEach(function (counter) {
                var target = parseInt(counter.getAttribute('data-target'));
                var duration = 2000;
                var step = target / (duration / 16);
                var current = 0;

                function updateCounter() {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                }

                updateCounter();
            });

            counterAnimated = true;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounters();
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(aboutSection);
    }

    initCounterAnimation();

    // ==================== Parallax Effect on Hero ====================
    var heroContent = document.querySelector('.hero-content');
    if (heroContent && window.innerWidth > 768) {
        window.addEventListener('scroll', function () {
            var scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                var opacity = 1 - scrollY / (window.innerHeight * 0.8);
                var translateY = scrollY * 0.3;
                heroContent.style.opacity = Math.max(opacity, 0);
                heroContent.style.transform = 'translateY(' + translateY + 'px)';
            }
        }, { passive: true });
    }

    // ==================== Header Background on Page Load ====================
    if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
    }

    // ==================== Keyboard Navigation for Carousel ====================
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
            heroSwiper.slidePrev();
        } else if (e.key === 'ArrowRight') {
            heroSwiper.slideNext();
        }
    });

    // ==================== Float Phone ====================
    var floatPhone = document.getElementById('floatPhone');
    if (floatPhone) {
        setTimeout(function () {
            var icon = floatPhone.querySelector('.float-phone-icon');
            if (icon) {
                icon.style.animation = 'floatPulse 1.5s infinite';
            }
        }, 5000);
    }

    // ==================== Console Welcome ====================
    console.log(
        '%c 福州信霖管理咨询有限公司 %c XINLIN CONSULTING ',
        'background:#1a3a5c;color:#c49b4f;padding:8px 16px;font-size:16px;font-weight:bold;border-radius:4px 0 0 4px;',
        'background:#c49b4f;color:#fff;padding:8px 16px;font-size:12px;border-radius:0 4px 4px 0;'
    );
    console.log('%c📞 咨询热线：17859568876', 'color:#1a3a5c;font-size:14px;');
    console.log('%c📍 地址：福建省福州市鼓楼区五凤街道铜盘路北侧保利天悦花园（地块二)B3#楼1层01商铺', 'color:#666;font-size:12px;');
});

// ==================== Loader ====================
function initLoader() {
    var loader = document.getElementById('loaderWrapper');
    if (!loader) return;

    window.addEventListener('load', function () {
        setTimeout(function () {
            loader.classList.add('hidden');
            setTimeout(function () {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
            }, 500);
        }, 600);
    });

    setTimeout(function () {
        if (!loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
            setTimeout(function () {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
            }, 500);
        }
    }, 3000);
}

// ==================== Dynamic Content Loader ====================
function loadContent() {
    fetch('/api/public-data')
        .then(function (res) {
            if (!res.ok) throw new Error('API unavailable');
            return res.json();
        })
        .then(function (d) {
            renderSiteData(d);
        })
        .catch(function () {
            // API not available, use hardcoded HTML content (fallback)
            console.log('💡 使用静态内容。启动后台服务器以启用动态编辑功能。');
        });
}

function renderSiteData(d) {
    // --- Site Meta ---
    if (d.site) {
        document.title = d.site.title || document.title;
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && d.site.description) metaDesc.content = d.site.description;

        // Logo
        if (d.site.logo) {
            var logos = document.querySelectorAll('.logo-img');
            logos.forEach(function (img) {
                if (!img.getAttribute('data-original')) {
                    img.setAttribute('data-original', img.src);
                }
                img.src = d.site.logo;
            });
            var footerLogos = document.querySelectorAll('.footer-logo-img');
            footerLogos.forEach(function (img) {
                img.src = d.site.logo;
            });
        }

        // Loader text
        if (d.site.companyNameShort) {
            var loaderText = document.querySelector('.loader-text');
            if (loaderText) loaderText.textContent = d.site.companyNameShort;
        }
    }

    // --- Hero Slides ---
    if (d.hero && d.hero.slides) {
        var slides = document.querySelectorAll('.hero-slide');
        d.hero.slides.forEach(function (s, i) {
            if (!slides[i]) return;
            var tagEl = slides[i].querySelector('.hero-tag');
            var titleEl = slides[i].querySelector('.hero-title');
            var descEl = slides[i].querySelector('.hero-desc');
            var btns = slides[i].querySelectorAll('.btn');

            if (tagEl && s.tag) tagEl.textContent = s.tag;
            if (titleEl && s.title) titleEl.innerHTML = s.title;
            if (descEl && s.desc) descEl.textContent = s.desc;

            // Update button 1 text
            if (btns[0] && s.btn1Text) {
                var icon1 = btns[0].querySelector('i');
                btns[0].childNodes[btns[0].childNodes.length - 1].textContent = ' ' + s.btn1Text;
                if (icon1) {
                    btns[0].innerHTML = s.btn1Text + ' ' + icon1.outerHTML;
                }
            }
            // Update button 2 text
            if (btns[1] && s.btn2Text) {
                var icon2 = btns[1].querySelector('i');
                if (icon2) {
                    btns[1].innerHTML = s.btn2Text + ' ' + icon2.outerHTML;
                }
            }
        });
    }

    // --- Feature Strip ---
    if (d.featureStrip) {
        var featureItems = document.querySelectorAll('.feature-item');
        d.featureStrip.forEach(function (f, i) {
            if (!featureItems[i]) return;
            var h4 = featureItems[i].querySelector('h4');
            var p = featureItems[i].querySelector('p');
            if (h4) h4.textContent = f.number + ' ' + f.unit;
            if (p) p.textContent = f.label;
        });
    }

    // --- Business Cards ---
    if (d.businessCards) {
        var bizContainer = document.querySelector('.business-grid');
        if (bizContainer) {
            // Clear and rebuild
            bizContainer.innerHTML = '';
            d.businessCards.forEach(function (card, i) {
                var highlightClass = card.highlight ? ' highlight-card' : '';
                var col = document.createElement('div');
                col.className = 'business-card';
                col.setAttribute('data-aos', 'fade-up');
                col.setAttribute('data-aos-delay', String((i % 4) * 100));
                col.innerHTML =
                    '<div class="card-icon-wrap">' +
                    '<div class="card-icon' + highlightClass + '">' +
                    '<i class="fa-solid ' + card.icon + '"></i>' +
                    '</div></div>' +
                    '<h3 class="card-title">' + escapeHtml(card.title) + '</h3>' +
                    '<p class="card-desc">' + escapeHtml(card.desc) + '</p>' +
                    '<a href="#contact" class="card-link">了解更多 <i class="fa-solid fa-chevron-right"></i></a>';
                bizContainer.appendChild(col);
            });
            AOS.refresh();
        }
    }

    // --- About Section ---
    if (d.about) {
        var aboutTexts = document.querySelectorAll('.about-text');
        if (aboutTexts[0] && d.about.text1) aboutTexts[0].innerHTML = d.about.text1;
        if (aboutTexts[1] && d.about.text2) aboutTexts[1].innerHTML = d.about.text2;
        if (aboutTexts[2] && d.about.text3) aboutTexts[2].innerHTML = d.about.text3;

        if (d.about.stats) {
            var statItems = document.querySelectorAll('.stat-item');
            d.about.stats.forEach(function (stat, i) {
                if (!statItems[i]) return;
                var counter = statItems[i].querySelector('.counter');
                var suffix = statItems[i].querySelector('.stat-number span:last-child');
                var label = statItems[i].querySelector('p');
                if (counter) {
                    counter.textContent = String(stat.number);
                    counter.setAttribute('data-target', String(stat.number));
                }
                if (suffix) suffix.textContent = stat.suffix;
                if (label) label.textContent = stat.label;
            });
        }
    }

    // --- News Section ---
    if (d.news) {
        var newsContainer = document.querySelector('.news-grid');
        if (newsContainer) {
            newsContainer.innerHTML = '';
            d.news.forEach(function (n, i) {
                var col = document.createElement('div');
                col.className = 'news-card';
                col.setAttribute('data-aos', 'fade-up');
                col.setAttribute('data-aos-delay', String(i * 100));
                col.innerHTML =
                    '<div class="news-img">' +
                    '<img src="' + (n.image || '') + '" alt="' + escapeHtml(n.title) + '">' +
                    '<div class="news-date">' +
                    '<span class="date-day">' + escapeHtml(n.dateDay) + '</span>' +
                    '<span class="date-month">' + escapeHtml(n.dateMonth) + '</span>' +
                    '</div></div>' +
                    '<div class="news-body">' +
                    '<span class="news-cat">' + escapeHtml(n.category) + '</span>' +
                    '<h3 class="news-title"><a href="news.html?id=' + encodeURIComponent(n.id || '') + '">' + escapeHtml(n.title) + '</a></h3>' +
                    '<p class="news-excerpt">' + escapeHtml(n.excerpt) + '</p>' +
                    '<a href="news.html?id=' + encodeURIComponent(n.id || '') + '" class="news-link">阅读全文 <i class="fa-solid fa-arrow-right"></i></a>' +
                    '</div>';
                newsContainer.appendChild(col);
            });
            AOS.refresh();
        }
    }

    // --- Client Logos ---
    if (d.clients) {
        var clientsContainer = document.querySelector('.clients-grid');
        if (clientsContainer) {
            clientsContainer.innerHTML = '';
            d.clients.forEach(function (c) {
                var item = document.createElement('div');
                item.className = 'client-item';
                item.innerHTML =
                    '<div class="client-logo-wrap">' +
                    '<img src="' + (c.image || '') + '" alt="' + escapeHtml(c.name || '合作客户') + '" class="client-logo">' +
                    '</div>';
                clientsContainer.appendChild(item);
            });
        }
    }

    // --- Contact / CTA Section ---
    if (d.contact) {
        var ctaCards = document.querySelectorAll('.cta-card');
        if (ctaCards[0]) {
            var phoneLinks = ctaCards[0].querySelectorAll('.cta-card-link');
            if (phoneLinks[0] && d.contact.phone1) {
                phoneLinks[0].textContent = d.contact.phone1;
                phoneLinks[0].href = 'tel:' + d.contact.phone1.replace(/-/g, '');
            }
            if (phoneLinks[1] && d.contact.phone2) {
                phoneLinks[1].textContent = d.contact.phone2;
                phoneLinks[1].href = 'tel:' + d.contact.phone2.replace(/-/g, '');
            }
        }
        if (ctaCards[1] && d.contact.address) {
            var addrP = ctaCards[1].querySelector('p');
            if (addrP) addrP.innerHTML = d.contact.address.replace(/\n/g, '<br>');
        }
        if (ctaCards[2] && d.contact.email) {
            var emailLink = ctaCards[2].querySelector('.cta-card-link');
            if (emailLink) {
                emailLink.textContent = d.contact.email;
                emailLink.href = 'mailto:' + d.contact.email;
            }
        }
    }

    // --- Footer ---
    if (d.footer) {
        if (d.footer.about) {
            var footerAbout = document.querySelector('.footer-about-text');
            if (footerAbout) footerAbout.textContent = d.footer.about;
        }
        if (d.footer.copyright) {
            var copyright = document.querySelector('.copyright');
            if (copyright) copyright.textContent = d.footer.copyright;
        }
        if (d.footer.icp) {
            var icpLink = document.querySelector('.icp a');
            if (icpLink) icpLink.textContent = d.footer.icp;
        }
        if (d.footer.beian) {
            var beianSpan = document.querySelector('.icp span:last-child');
            if (beianSpan && d.footer.beian !== '闽公网安备 XXXXXXXXXXXX号') {
                beianSpan.textContent = d.footer.beian;
            }
        }

        // Update quick links
        if (d.footer.quickLinks) {
            var quickLinksUl = document.querySelectorAll('.footer-links')[0];
            if (quickLinksUl) {
                quickLinksUl.innerHTML = '';
                d.footer.quickLinks.forEach(function (l) {
                    var li = document.createElement('li');
                    li.innerHTML = '<a href="' + l.href + '"><i class="fa-solid fa-chevron-right"></i> ' + escapeHtml(l.text) + '</a>';
                    quickLinksUl.appendChild(li);
                });
            }
        }

        // Update friendly links
        if (d.footer.friendlyLinks) {
            var friendlyLinksUl = document.querySelectorAll('.footer-links')[1];
            if (friendlyLinksUl) {
                friendlyLinksUl.innerHTML = '';
                d.footer.friendlyLinks.forEach(function (l) {
                    var li = document.createElement('li');
                    li.innerHTML = '<a href="' + l.href + '">' + escapeHtml(l.text) + '</a>';
                    friendlyLinksUl.appendChild(li);
                });
            }
        }
    }

    // --- Contact info in footer ---
    if (d.contact) {
        var footerPhones = document.querySelectorAll('.footer-phones a');
        if (footerPhones[0] && d.contact.phone1) {
            footerPhones[0].textContent = d.contact.phone1;
            footerPhones[0].href = 'tel:' + d.contact.phone1.replace(/-/g, '');
        }
        if (footerPhones[1] && d.contact.phone2) {
            footerPhones[1].textContent = d.contact.phone2;
            footerPhones[1].href = 'tel:' + d.contact.phone2.replace(/-/g, '');
        }

        var footerContactItems = document.querySelectorAll('.footer-contact li');
        if (footerContactItems[0] && d.contact.address) {
            var addrSpan = footerContactItems[0].querySelector('span');
            if (addrSpan) addrSpan.textContent = d.contact.address;
        }
        if (footerContactItems[2] && d.contact.email) {
            var emailA = footerContactItems[2].querySelector('a');
            if (emailA) {
                emailA.textContent = d.contact.email;
                emailA.href = 'mailto:' + d.contact.email;
            }
        }
        if (footerContactItems[3] && d.contact.workHours) {
            var hoursSpan = footerContactItems[3].querySelector('span');
            if (hoursSpan) hoursSpan.textContent = d.contact.workHours;
        }
    }

    // Update float phone
    if (d.contact && d.contact.phone2) {
        var floatPhone = document.getElementById('floatPhone');
        if (floatPhone) {
            floatPhone.href = 'tel:' + d.contact.phone2.replace(/-/g, '');
        }
    }

    console.log('✅ 动态内容加载完成');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
