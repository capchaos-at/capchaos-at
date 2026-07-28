/* ==========================================================================
   CapChaos — static site behaviour
   Hash-based article navigation, mobile menu, in-page scrolling, legal TOC.
   ========================================================================== */

(function () {
	'use strict';

	var DEFAULT_ARTICLE = 'home';

	/* Per-article browser/meta tags, carried over from the former Angular components. */
	var ARTICLES = {
		'home': {
			title: 'CapChaos - Software Development & Tactical Management Service',
			description: 'Implementing your strategy by converting high-level objectives into low-level tactical decision making, using cutting edge technology and years of hands-on experience in management methodology.',
			image: 'assets/images/mainbg.webp'
		},
		'business-intelligence': {
			title: 'Business Intelligence Service - CapChaos',
			description: 'Gathering, storing and processing large amounts of data is required to formulate an educated opinion about any one of the options available to choose from prior making a decision. Thus BI is the backbone of decision making.',
			image: 'assets/images/business-intelligence-main.webp'
		},
		'software-strategy': {
			title: 'Software Strategy Service - CapChaos',
			description: 'Choosing the right tech-stack is paramount to success in scaling your venture. Conversely, picking the wrong components will become dreadful during growth. CapChaos has the knowledge and network to get your organization on the right track.',
			image: 'assets/images/software-strategy-main.webp'
		},
		'tactical-management': {
			title: 'Tactical Management Service - CapChaos',
			description: 'Beyond strategic planning is the need for implementing strategy the right way, with the best tools and the willingness to drive change. This is tactical management as the predominant value driver to execute strategy.',
			image: 'assets/images/tactical-management-main.webp'
		},
		'contact': {
			title: 'Contact - CapChaos',
			description: 'Get in touch with me via e-mail or LinkedIn. Am looking forward to exploring the opportunity in working for your organization.',
			image: 'assets/images/contact.webp'
		},
		'notice': {
			title: 'Legal Notice - CapChaos',
			description: 'All the personal information required by law about CapChaos e.U.',
			image: 'assets/images/b2b.webp'
		},
		'terms': {
			title: 'Terms & Conditions - CapChaos',
			description: 'The terms and conditions governing the business relationship between CapChaos e.U. and its clients.',
			image: 'assets/images/b2b.webp'
		}
	};

	/* Deep links from the retired router still floating around out there. */
	var LEGACY_PATHS = {
		'/services/business-intelligence': 'business-intelligence',
		'/services/software-strategy': 'software-strategy',
		'/services/tactical-management': 'tactical-management',
		'/legal/contact': 'contact',
		'/legal/notice': 'notice',
		'/legal/terms': 'terms'
	};

	var body = document.body;
	var header = document.getElementById('site-header');
	var navToggle = document.getElementById('nav-toggle');
	var navToggleIcon = navToggle ? navToggle.querySelector('.material-icons') : null;
	var navBackdrop = document.getElementById('nav-backdrop');
	var compactNav = window.matchMedia('(max-width: 1080px)');
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	function $$(selector, root) {
		return Array.prototype.slice.call((root || document).querySelectorAll(selector));
	}

	/* ----------------------------------------------------------------------
	   Header elevation on scroll
	   ---------------------------------------------------------------------- */

	if (header) {
		var updateHeader = function () {
			header.classList.toggle('is-stuck', window.scrollY > 8);
		};
		window.addEventListener('scroll', updateHeader, {passive: true});
		updateHeader();
	}

	/* ----------------------------------------------------------------------
	   Mobile menu
	   ---------------------------------------------------------------------- */

	function setNav(open) {
		body.classList.toggle('nav-open', open);
		if (navToggle) {
			navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
		}
		if (navToggleIcon) {
			navToggleIcon.textContent = open ? 'close' : 'menu';
		}
	}

	function closeNav() {
		if (body.classList.contains('nav-open')) {
			setNav(false);
		}
	}

	if (navToggle) {
		navToggle.addEventListener('click', function () {
			setNav(!body.classList.contains('nav-open'));
		});
	}

	if (navBackdrop) {
		navBackdrop.addEventListener('click', closeNav);
	}

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') {
			closeNav();
		}
	});

	/* The menu only exists below the nav breakpoint; drop its state on the way up. */
	function onBreakpointChange() {
		if (!compactNav.matches) {
			closeNav();
		}
	}

	if (compactNav.addEventListener) {
		compactNav.addEventListener('change', onBreakpointChange);
	} else if (compactNav.addListener) {
		compactNav.addListener(onBreakpointChange);
	}

	/* ----------------------------------------------------------------------
	   Hash navigation
	   ---------------------------------------------------------------------- */

	function metaTag(selector, attribute, name) {
		var tag = document.head.querySelector(selector);
		if (!tag) {
			tag = document.createElement('meta');
			tag.setAttribute(attribute, name);
			document.head.appendChild(tag);
		}
		return tag;
	}

	function applyMeta(id) {
		var meta = ARTICLES[id];
		if (!meta) {
			return;
		}
		document.title = meta.title;
		metaTag('meta[name="description"]', 'name', 'description').setAttribute('content', meta.description);
		metaTag('meta[property="og:title"]', 'property', 'og:title').setAttribute('content', meta.title);
		metaTag('meta[property="og:description"]', 'property', 'og:description').setAttribute('content', meta.description);
		metaTag('meta[property="og:image"]', 'property', 'og:image').setAttribute('content', '/' + meta.image);
	}

	function currentArticleId() {
		var id = (window.location.hash || '').replace(/^#\/?/, '');
		return Object.prototype.hasOwnProperty.call(ARTICLES, id) ? id : DEFAULT_ARTICLE;
	}

	function showArticle(id, scrollToTop) {
		$$('.article').forEach(function (article) {
			article.classList.toggle('is-active', article.id === id);
		});

		$$('[data-nav-link]').forEach(function (link) {
			var isActive = link.getAttribute('href') === '#' + id;
			link.classList.toggle('active-link', isActive);
			if (isActive) {
				link.setAttribute('aria-current', 'page');
			} else {
				link.removeAttribute('aria-current');
			}
		});

		applyMeta(id);
		syncToc();

		if (scrollToTop) {
			/* Jump, don't glide — the CSS smooth-scroll is meant for in-page anchors. */
			try {
				window.scrollTo({top: 0, left: 0, behavior: 'instant'});
			} catch (e) {
				window.scrollTo(0, 0);
			}
		}
	}

	window.addEventListener('hashchange', function () {
		showArticle(currentArticleId(), true);
		closeNav();
	});

	/* Re-tapping the link of the article you are already on fires no hashchange. */
	$$('[data-nav-link]').forEach(function (link) {
		link.addEventListener('click', closeNav);
	});

	/* ----------------------------------------------------------------------
	   In-page scrolling
	   Kept off the URL so the hash stays reserved for the router.
	   ---------------------------------------------------------------------- */

	function scrollToTarget(selector) {
		var target = document.querySelector(selector);
		if (!target) {
			return;
		}
		target.scrollIntoView({
			behavior: reduceMotion.matches ? 'auto' : 'smooth',
			block: 'start'
		});
	}

	$$('[data-scroll-to]').forEach(function (trigger) {
		trigger.addEventListener('click', function (event) {
			event.preventDefault();
			scrollToTarget(trigger.getAttribute('data-scroll-to'));
		});
	});

	/* ----------------------------------------------------------------------
	   Table of contents for the terms article
	   ---------------------------------------------------------------------- */

	var tocLinks = $$('[data-toc-link]');
	var tocSections = tocLinks
		.map(function (link) { return document.querySelector(link.getAttribute('href')); })
		.filter(Boolean);

	function markToc(id) {
		tocLinks.forEach(function (link) {
			link.classList.toggle('is-current', link.getAttribute('href') === '#' + id);
		});
	}

	tocLinks.forEach(function (link) {
		link.addEventListener('click', function (event) {
			event.preventDefault();
			var id = link.getAttribute('href').slice(1);
			scrollToTarget('#' + id);
			markToc(id);
		});
	});

	/* Highlight whichever legal section is currently nearest the top. */
	function syncToc() {
		if (!tocSections.length) {
			return;
		}
		var offset = (header ? header.offsetHeight : 0) + 32;
		var current = tocSections[0];
		tocSections.forEach(function (section) {
			if (section.getBoundingClientRect().top <= offset) {
				current = section;
			}
		});
		markToc(current.id);
	}

	if (tocSections.length) {
		window.addEventListener('scroll', syncToc, {passive: true});
	}

	/* ----------------------------------------------------------------------
	   Boot
	   ---------------------------------------------------------------------- */

	/* Rewrite an old router URL into its hash equivalent before the first render.
	   Only over http(s) — replaceState on a file:// path throws. */
	if (/^https?:$/.test(window.location.protocol) && !window.location.hash) {
		var legacy = LEGACY_PATHS[window.location.pathname.replace(/\/$/, '')];
		window.history.replaceState(null, '', '/#' + (legacy || DEFAULT_ARTICLE));
	}

	showArticle(currentArticleId(), false);
})();
