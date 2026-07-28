/* ==========================================================================
   CapChaos — static site behaviour
   Hash-based article navigation, off-canvas sidebar, steppers.
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
	var navToggle = document.getElementById('nav-toggle');
	var navToggleIcon = navToggle ? navToggle.querySelector('.material-icons') : null;
	var backdrop = document.getElementById('backdrop');
	var mobileQuery = window.matchMedia('(max-width: 1023px)');

	/* ----------------------------------------------------------------------
	   Sidebar
	   ---------------------------------------------------------------------- */

	function setNav(open) {
		body.classList.toggle('nav-open', open);
		if (navToggle) {
			navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		}
		if (navToggleIcon) {
			navToggleIcon.textContent = open ? 'close' : 'menu';
		}
	}

	function closeNavOnMobile() {
		if (mobileQuery.matches) {
			setNav(false);
		}
	}

	if (navToggle) {
		navToggle.addEventListener('click', function () {
			setNav(!body.classList.contains('nav-open'));
		});
	}

	if (backdrop) {
		backdrop.addEventListener('click', function () {
			setNav(false);
		});
	}

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && body.classList.contains('nav-open')) {
			closeNavOnMobile();
		}
	});

	/* The drawer is permanent from 1024px up, so drop the "open" state when crossing over. */
	function syncNavToViewport() {
		if (!mobileQuery.matches) {
			setNav(false);
		}
	}

	if (mobileQuery.addEventListener) {
		mobileQuery.addEventListener('change', syncNavToViewport);
	} else if (mobileQuery.addListener) {
		mobileQuery.addListener(syncNavToViewport);
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
		var articles = document.querySelectorAll('.article');
		for (var i = 0; i < articles.length; i++) {
			articles[i].classList.toggle('is-active', articles[i].id === id);
		}

		var links = document.querySelectorAll('[data-nav-link]');
		for (var j = 0; j < links.length; j++) {
			var isActive = links[j].getAttribute('href') === '#' + id;
			links[j].classList.toggle('active-link', isActive);
			if (isActive) {
				links[j].setAttribute('aria-current', 'page');
			} else {
				links[j].removeAttribute('aria-current');
			}
		}

		applyMeta(id);

		if (scrollToTop) {
			/* Jump, don't glide — the CSS smooth-scroll is meant for in-page anchors. */
			try {
				window.scrollTo({top: 0, left: 0, behavior: 'instant'});
			} catch (e) {
				window.scrollTo(0, 0);
			}
		}
	}

	function onHashChange() {
		showArticle(currentArticleId(), true);
		closeNavOnMobile();
	}

	window.addEventListener('hashchange', onHashChange);

	/* Re-tapping the link of the article you are already on fires no hashchange. */
	document.querySelectorAll('[data-nav-link]').forEach(function (link) {
		link.addEventListener('click', closeNavOnMobile);
	});

	/* ----------------------------------------------------------------------
	   Accordion "Explore" shortcut
	   ---------------------------------------------------------------------- */

	var exploreBtn = document.getElementById('explore-button');
	if (exploreBtn) {
		exploreBtn.addEventListener('click', function () {
			var panel = document.getElementById('panel-what');
			var accordion = document.getElementById('home-accordion');
			if (panel) {
				panel.open = true;
			}
			if (accordion) {
				accordion.scrollIntoView({behavior: 'smooth', block: 'start'});
			}
		});
	}

	/* ----------------------------------------------------------------------
	   Steppers
	   ---------------------------------------------------------------------- */

	function initStepper(stepper) {
		var steps = Array.prototype.slice.call(stepper.querySelectorAll('.step'));
		if (!steps.length) {
			return;
		}

		function select(index) {
			steps.forEach(function (step, i) {
				step.classList.toggle('is-active', i === index);
				step.classList.toggle('is-done', i < index);
				var header = step.querySelector('.step-header');
				var panel = step.querySelector('.step-body');
				if (header) {
					header.setAttribute('aria-expanded', i === index ? 'true' : 'false');
				}
				if (panel) {
					panel.hidden = i !== index;
				}
			});
		}

		steps.forEach(function (step, index) {
			var header = step.querySelector('.step-header');
			if (header) {
				header.addEventListener('click', function () {
					select(index);
				});
			}

			step.querySelectorAll('[data-step-next]').forEach(function (btn) {
				btn.addEventListener('click', function () {
					select(Math.min(index + 1, steps.length - 1));
					step.scrollIntoView({behavior: 'smooth', block: 'nearest'});
				});
			});

			step.querySelectorAll('[data-step-prev]').forEach(function (btn) {
				btn.addEventListener('click', function () {
					select(Math.max(index - 1, 0));
					step.scrollIntoView({behavior: 'smooth', block: 'nearest'});
				});
			});
		});

		select(0);
	}

	document.querySelectorAll('.stepper').forEach(initStepper);

	/* ----------------------------------------------------------------------
	   Boot
	   ---------------------------------------------------------------------- */

	/* Rewrite an old router URL into its hash equivalent before the first render.
	   Only over http(s) — replaceState on a file:// path throws. */
	var isHttp = /^https?:$/.test(window.location.protocol);

	if (isHttp && !window.location.hash) {
		var legacy = LEGACY_PATHS[window.location.pathname.replace(/\/$/, '')];
		window.history.replaceState(null, '', '/#' + (legacy || DEFAULT_ARTICLE));
	}

	showArticle(currentArticleId(), false);
})();
