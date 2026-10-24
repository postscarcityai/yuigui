// Generated from tokens.json by build.mjs. Do not edit; edit tokens.json and run `node site/lib/yuicss/build.mjs`.
export default {
  "name": "yuicss",
  "version": 1,
  "about": "The one source of how Yui looks. Compiled to CSS variables (build.mjs) and later to Swift (YuiTokens.swift). An agent look changes color, type, shape and motion through these and nothing else.",
  "color": {
    "about": "Yui's own palette, the default look. Agent looks compile their own palettes from a recipe (site/lib/yl/look.mjs) and go through the same contrast guard: ink and muted at 4.5:1 on paper and surface, accent at 3:1 on paper, accent-ink at 4.5:1 on accent.",
    "light": {
      "paper": "#FFF9F0",
      "surface": "#FFFFFF",
      "ink": "#3A3340",
      "muted": "#6E6478",
      "line": "#F0E4D6",
      "accent": "#FF7E8A",
      "accentInk": "#3A3340"
    },
    "dark": {
      "paper": "#231D33",
      "surface": "#2F2842",
      "ink": "#F6EEF7",
      "muted": "#A99FB8",
      "line": "#3D3452",
      "accent": "#FF7E8A",
      "accentInk": "#2A2238"
    },
    "ramp": {
      "about": "The accent as ten steps. 50 sits next to the paper and 900 far from it, in light and in dark, so bg-accent-100 is always a soft tint and ink stays readable on 50 to 300.",
      "light": {
        "50": 0.965,
        "100": 0.925,
        "200": 0.86,
        "300": 0.78,
        "400": 0.68,
        "600": 0.5,
        "700": 0.42,
        "800": 0.34,
        "900": 0.26
      },
      "dark": {
        "50": 0.19,
        "100": 0.23,
        "200": 0.29,
        "300": 0.37,
        "400": 0.47,
        "600": 0.68,
        "700": 0.78,
        "800": 0.86,
        "900": 0.93
      }
    },
    "semantic": {
      "about": "Good, warn and bad as hues. Each becomes a fill (3:1 on paper), an ink for text on that fill (4.5:1), a text color (4.5:1 on paper and surface) and a soft tint.",
      "good": {
        "hue": 152,
        "sat": 0.55
      },
      "warn": {
        "hue": 40,
        "sat": 0.8
      },
      "bad": {
        "hue": 4,
        "sat": 0.7
      }
    }
  },
  "type": {
    "fonts": {
      "rounded": "ui-rounded, \"SF Pro Rounded\", var(--font-nunito, Nunito), system-ui, sans-serif",
      "default": "-apple-system, BlinkMacSystemFont, \"SF Pro\", system-ui, sans-serif",
      "serif": "ui-serif, \"New York\", Georgia, \"Times New Roman\", serif",
      "mono": "ui-monospace, \"SF Mono\", Menlo, Consolas, monospace"
    },
    "scale": {
      "xs": 12,
      "sm": 14,
      "base": 17,
      "lg": 20,
      "xl": 24,
      "2xl": 30,
      "3xl": 38,
      "4xl": 48
    },
    "leading": {
      "tight": 1.1,
      "snug": 1.25,
      "normal": 1.5,
      "relaxed": 1.65
    },
    "weight": {
      "regular": 500,
      "semibold": 600,
      "bold": 700,
      "heavy": 800
    },
    "body": 400,
    "heading": "heavy",
    "headings": {
      "h1": "2xl",
      "h2": "xl",
      "h3": "lg",
      "h4": "base"
    }
  },
  "space": {
    "about": "A 4-point scale with Tailwind's numbers: p-4 is 16px, h-32 is 128px.",
    "scale": {
      "0": 0,
      "1": 4,
      "2": 8,
      "3": 12,
      "4": 16,
      "5": 20,
      "6": 24,
      "8": 32,
      "10": 40,
      "12": 48,
      "16": 64,
      "px": 1
    },
    "sizes": {
      "20": 80,
      "24": 96,
      "32": 128,
      "40": 160,
      "48": 192,
      "56": 224,
      "64": 256
    },
    "gap": 12,
    "pad": 20,
    "control": 52,
    "tap": 44
  },
  "shape": {
    "about": "One radius per look for cards and pictures, a smaller one for controls. Round, soft and square are the three agent choices; yui is the app's own.",
    "radius": {
      "round": 24,
      "soft": 18,
      "square": 10,
      "yui": 22
    },
    "control": {
      "round": 999,
      "soft": 14,
      "square": 8,
      "yui": 16
    },
    "fixed": {
      "none": 0,
      "sm": 8,
      "md": 12,
      "lg": 16,
      "xl": 20,
      "2xl": 28,
      "3xl": 36,
      "full": 999
    },
    "shadow": {
      "soft": {
        "light": "0 6px 20px rgba(58, 51, 64, .08)",
        "dark": "0 6px 20px rgba(0, 0, 0, .28)"
      },
      "lift": {
        "light": "0 14px 40px rgba(58, 51, 64, .14)",
        "dark": "0 14px 40px rgba(0, 0, 0, .4)"
      }
    },
    "line": 1.5
  },
  "motion": {
    "about": "The motion look (YUI-123): a pace, an ease, how things come on, how they breathe. The same numbers as site/lib/yl/motion.mjs, checked equal by yuicss.test.mjs.",
    "base": {
      "enter": 440,
      "handoff": 360,
      "stagger": 80,
      "beat": 600,
      "open": 520
    },
    "paces": {
      "slow": 1.4,
      "even": 1,
      "quick": 0.68
    },
    "eases": {
      "float": "cubic-bezier(.45,0,.2,1)",
      "spring": "cubic-bezier(.2,.9,.3,1.3)",
      "sharp": "cubic-bezier(.3,0,0,1)",
      "heavy": "cubic-bezier(.7,0,.2,1)"
    },
    "enters": [
      "rise",
      "pop",
      "slide",
      "drop",
      "fade"
    ],
    "pulses": {
      "soft": 3.6,
      "beat": 1.7,
      "tick": 1.1,
      "still": 0
    },
    "characters": {
      "bouncy": {
        "pace": "even",
        "ease": "spring",
        "enter": "pop",
        "pulse": "beat"
      },
      "calm": {
        "pace": "slow",
        "ease": "float",
        "enter": "rise",
        "pulse": "soft"
      },
      "snappy": {
        "pace": "quick",
        "ease": "sharp",
        "enter": "slide",
        "pulse": "tick"
      }
    }
  }
};
