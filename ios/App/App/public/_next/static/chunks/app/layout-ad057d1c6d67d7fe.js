(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [177],
  {
    514: (e, r, t) => {
      Promise.resolve().then(t.t.bind(t, 30347, 23)),
        Promise.resolve().then(t.t.bind(t, 62093, 23)),
        Promise.resolve().then(t.t.bind(t, 27735, 23)),
        Promise.resolve().then(t.bind(t, 22874)),
        Promise.resolve().then(t.bind(t, 95060)),
        Promise.resolve().then(t.bind(t, 57400));
    },
    22874: (e, r, t) => {
      'use strict';
      t.d(r, { default: () => o });
      var a = t(95155),
        s = t(34869),
        l = t(29911);
      function n() {
        let e = new Date().getFullYear();
        return (0, a.jsx)('footer', {
          className:
            'w-full border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900',
          children: (0, a.jsxs)('div', {
            className:
              'max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground',
            children: [
              (0, a.jsx)('div', {
                className: 'text-center sm:text-left',
                children: (0, a.jsxs)('p', {
                  children: [
                    '\xa9 ',
                    e,
                    ' ',
                    (0, a.jsx)('span', {
                      className: 'font-semibold text-foreground',
                      children: 'Jc Miguel',
                    }),
                    '. All rights reserved.',
                  ],
                }),
              }),
              (0, a.jsxs)('div', {
                className: 'mt-3 sm:mt-0 flex items-center gap-4',
                children: [
                  (0, a.jsx)('a', {
                    href: 'https://github.com/xjeyceex',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    'aria-label': 'GitHub',
                    className: 'hover:text-foreground transition-colors',
                    children: (0, a.jsx)(l.hL4, { className: 'w-5 h-5' }),
                  }),
                  (0, a.jsx)('a', {
                    href: 'https://www.linkedin.com/in/jc-miguel-beltran/',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    'aria-label': 'LinkedIn',
                    className: 'hover:text-foreground transition-colors',
                    children: (0, a.jsx)(l.QEs, { className: 'w-5 h-5' }),
                  }),
                  (0, a.jsx)('a', {
                    href: 'https://jcmiguel-portfolio.vercel.app',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    'aria-label': 'Portfolio',
                    className: 'hover:text-foreground transition-colors',
                    children: (0, a.jsx)(s.A, { className: 'w-5 h-5' }),
                  }),
                ],
              }),
            ],
          }),
        });
      }
      var i = t(35695);
      function o(e) {
        let { children: r } = e,
          t = '/' === (0, i.usePathname)();
        return (0, a.jsxs)('div', {
          className: 'flex flex-col min-h-[100dvh] layout-wrapper '.concat(
            t ? '' : 'pt-12 md:pt-16'
          ),
          children: [
            (0, a.jsx)('main', {
              className: 'flex-1 '.concat(t ? '' : 'p-4'),
              children: r,
            }),
            (0, a.jsx)(n, {}),
          ],
        });
      }
    },
    30347: () => {},
    57400: (e, r, t) => {
      'use strict';
      t.d(r, { default: () => l });
      var a = t(95155),
        s = t(51362);
      function l(e) {
        let { children: r } = e;
        return (0, a.jsx)(s.N, {
          attribute: 'class',
          defaultTheme: 'system',
          enableSystem: !0,
          children: r,
        });
      }
    },
    95060: (e, r, t) => {
      'use strict';
      t.d(r, { default: () => x });
      var a = t(95155),
        s = t(6874),
        l = t.n(s),
        n = t(35695),
        i = t(12115),
        o = t(24717),
        d = t(52596),
        c = t(51362);
      let h = [
        { name: 'Money Tracker', href: '/money-tracker', icon: o.DAO },
        { name: 'Money Tracker Update', href: '/money-trackerv2', icon: o.Em8 },
      ];
      function x() {
        let e = (0, n.usePathname)(),
          [r, t] = (0, i.useState)(!1),
          [s, x] = (0, i.useState)(!1),
          { setTheme: m, resolvedTheme: b } = (0, c.D)(),
          [u, f] = (0, i.useState)(!1);
        (0, i.useEffect)(() => {
          f(!0);
          let e = () => {
            x(window.innerWidth < 768);
          };
          return (
            e(),
            window.addEventListener('resize', e),
            () => window.removeEventListener('resize', e)
          );
        }, []);
        let g = (0, i.useCallback)(() => {
            m('dark' === b ? 'light' : 'dark');
          }, [b, m]),
          k = (0, i.useCallback)(() => {
            t((e) => !e);
          }, []);
        if (!u) return null;
        let v = (r) => {
          let n = r.icon,
            i = e === r.href || e.startsWith(r.href + '/'),
            o = (0, d.A)(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium',
              'hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-[0.98]',
              i
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
              'border-l-4',
              i ? 'border-blue-500 dark:border-blue-400' : 'border-transparent',
              r.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
            );
          return (0, a.jsxs)(l(), {
            href: r.href,
            onClick: () => s && t(!1),
            className: o,
            children: [
              (0, a.jsx)(n, { className: 'w-5 h-5 flex-shrink-0' }),
              (0, a.jsx)('span', { className: 'truncate', children: r.name }),
            ],
          });
        };
        return (0, a.jsxs)(a.Fragment, {
          children: [
            (0, a.jsxs)('header', {
              className:
                'fixed top-0 left-0 right-0 z-50 h-16  bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-700 px-4 flex items-center justify-between',
              children: [
                (0, a.jsx)(l(), {
                  href: '/',
                  className:
                    'text-xl font-semibold text-gray-800 dark:text-white',
                  children: 'PesoWise',
                }),
                (0, a.jsxs)('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    (0, a.jsx)('button', {
                      onClick: g,
                      className:
                        'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors',
                      children:
                        'dark' === b
                          ? (0, a.jsx)(o.Q3K, {
                              className: 'w-5 h-5 text-yellow-400',
                            })
                          : (0, a.jsx)(o.Zt5, {
                              className: 'w-5 h-5 text-gray-600',
                            }),
                    }),
                    (0, a.jsx)('button', {
                      onClick: k,
                      className:
                        'p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800',
                      'aria-label': 'Toggle sidebar',
                      children: r
                        ? (0, a.jsx)(o.U_s, {
                            className:
                              'w-6 h-6 text-gray-600 dark:text-gray-300',
                          })
                        : (0, a.jsx)(o.TF4, {
                            className:
                              'w-6 h-6 text-gray-600 dark:text-gray-300',
                          }),
                    }),
                  ],
                }),
              ],
            }),
            (0, a.jsxs)('aside', {
              className: (0, d.A)(
                'fixed top-16 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-zinc-900 shadow-lg p-6 z-40',
                'transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-zinc-700',
                'right-0',
                r ? 'translate-x-0' : 'translate-x-full'
              ),
              'aria-hidden': !r,
              children: [
                (0, a.jsx)('nav', {
                  className:
                    'space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]',
                  children: h.map((e) =>
                    (0, a.jsx)('div', { children: v(e) }, e.href)
                  ),
                }),
                (0, a.jsxs)('div', {
                  className:
                    'pt-4 mt-4 border-t border-gray-100 dark:border-zinc-700 text-sm text-gray-500 dark:text-gray-400',
                  children: ['\xa9 ', new Date().getFullYear(), ' PesoWise'],
                }),
              ],
            }),
            r &&
              s &&
              (0, a.jsx)('div', {
                className: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-30',
                onClick: () => t(!1),
              }),
          ],
        });
      }
    },
  },
  (e) => {
    var r = (r) => e((e.s = r));
    e.O(0, [360, 777, 711, 991, 441, 684, 358], () => r(514)), (_N_E = e.O());
  },
]);
