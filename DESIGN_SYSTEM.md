# Movie App Design System — iOS Style

## 1. Color Tokens (iOS Semantic Colors)

### Light Mode
```json
{
  "label": "#000000",
  "secondaryLabel": "#3C3C4399",
  "tertiaryLabel": "#3C3C434D",
  "quaternaryLabel": "#3C3C432E",
  "systemBackground": "#FFFFFF",
  "secondarySystemBackground": "#F2F2F7",
  "tertiarySystemBackground": "#FFFFFF",
  "systemGroupedBackground": "#F2F2F7",
  "secondarySystemGroupedBackground": "#FFFFFF",
  "tertiarySystemGroupedBackground": "#F2F2F7",
  "separator": "#3C3C434A",
  "opaqueSeparator": "#C6C6C8",
  "link": "#007AFF",
  "systemBlue": "#007AFF",
  "systemGreen": "#34C759",
  "systemRed": "#FF3B30",
  "systemOrange": "#FF9F0A",
  "systemYellow": "#FFCC00",
  "systemPurple": "#AF52DE",
  "systemPink": "#FF2D55",
  "systemTeal": "#30B0C7",
  "systemIndigo": "#5856D6",
  "systemGray": "#8E8E93",
  "systemGray2": "#AEAAAF",
  "systemGray3": "#C7C7CC",
  "systemGray4": "#D1D1D6",
  "systemGray5": "#E5E5EA",
  "systemGray6": "#F2F2F7",
  "brandPrimary": "#E50914",
  "brandSecondary": "#F5F5F1",
  "ratingGold": "#FFC107",
  "ratingGray": "#9E9E9E"
}
```

### Dark Mode
```json
{
  "label": "#FFFFFF",
  "secondaryLabel": "#EBEBF599",
  "tertiaryLabel": "#EBEBF54D",
  "quaternaryLabel": "#EBEBF52E",
  "systemBackground": "#000000",
  "secondarySystemBackground": "#1C1C1E",
  "tertiarySystemBackground": "#2C2C2E",
  "systemGroupedBackground": "#000000",
  "secondarySystemGroupedBackground": "#1C1C1E",
  "tertiarySystemGroupedBackground": "#2C2C2E",
  "separator": "#5454584A",
  "opaqueSeparator": "#38383A",
  "link": "#0A84FF",
  "systemBlue": "#0A84FF",
  "systemGreen": "#30D158",
  "systemRed": "#FF453A",
  "systemOrange": "#FF9F0A",
  "systemYellow": "#FFD60A",
  "systemPurple": "#BF5AF2",
  "systemPink": "#FF375F",
  "systemTeal": "#64D2FF",
  "systemIndigo": "#5E5CE6",
  "systemGray": "#8E8E93",
  "systemGray2": "#636366",
  "systemGray3": "#48484A",
  "systemGray4": "#3A3A3C",
  "systemGray5": "#2C2C2E",
  "systemGray6": "#1C1C1E",
  "brandPrimary": "#E50914",
  "brandSecondary": "#1A1A1A",
  "ratingGold": "#FFC107",
  "ratingGray": "#757575"
}
```

---

## 2. Typography (SF Pro Display / SF Pro Text)

| Style | Font | Size | Weight | Line Height | Letter Spacing |
|-------|------|------|--------|-------------|----------------|
| Large Title | SF Pro Display | 34 | Bold (700) | 41 | 0.37 |
| Title 1 | SF Pro Display | 28 | Bold (700) | 34 | 0.36 |
| Title 2 | SF Pro Display | 22 | Bold (700) | 28 | 0.35 |
| Title 3 | SF Pro Display | 20 | Semibold (600) | 25 | 0.38 |
| Headline | SF Pro Text | 17 | Semibold (600) | 22 | -0.41 |
| Body | SF Pro Text | 17 | Regular (400) | 22 | -0.41 |
| Body Emphasized | SF Pro Text | 17 | Semibold (600) | 22 | -0.41 |
| Callout | SF Pro Text | 16 | Regular (400) | 21 | -0.32 |
| Subheadline | SF Pro Text | 15 | Regular (400) | 20 | -0.24 |
| Subheadline Emphasized | SF Pro Text | 15 | Semibold (600) | 20 | -0.24 |
| Footnote | SF Pro Text | 13 | Regular (400) | 18 | -0.08 |
| Footnote Emphasized | SF Pro Text | 13 | Semibold (600) | 18 | -0.08 |
| Caption 1 | SF Pro Text | 12 | Regular (400) | 16 | 0.0 |
| Caption 2 | SF Pro Text | 11 | Regular (400) | 13 | 0.06 |
| Caption 2 Emphasized | SF Pro Text | 11 | Semibold (600) | 13 | 0.06 |

---

## 3. Spacing System (8pt Base Grid)

| Token | Value | Usage |
|-------|-------|-------|
| space-0 | 0 | No spacing |
| space-1 | 4 | Tight spacing, icon gaps |
| space-2 | 8 | Base unit, component padding |
| space-3 | 12 | Component internal spacing |
| space-4 | 16 | Screen padding, card padding |
| space-5 | 20 | Section spacing |
| space-6 | 24 | Section gaps, card gaps |
| space-7 | 28 | Large section gaps |
| space-8 | 32 | Screen margins, major sections |
| space-10 | 40 | Large screen gaps |
| space-12 | 48 | Major section breaks |
| space-16 | 64 | Screen-level spacing |

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-none | 0 | Sharp corners |
| radius-sm | 4 | Small chips, tags |
| radius-md | 8 | Buttons, inputs, cards (compact) |
| radius-lg | 12 | Standard cards, sheets |
| radius-xl | 16 | Large cards, sheets, modals |
| radius-2xl | 20 | Large sheets, hero cards |
| radius-full | 9999 | Pills, avatars, badges |

---

## 5. Shadows (iOS Elevation)

| Level | Shadow | Usage |
|-------|--------|-------|
| level-0 | none | Flat elements |
| level-1 | 0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1) | Cards, buttons (rest) |
| level-2 | 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1) | Cards (hover), sheets |
| level-3 | 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.12) | Modals, sheets (raised) |
| level-4 | 0 8px 16px rgba(0,0,0,0.1), 0 16px 32px rgba(0,0,0,0.15) | Full-screen modals |

---

## 6. Component Specifications

### 6.1 Navigation Bar
```json
{
  "height": 44,
  "heightLarge": 52,
  "background": "systemBackground",
  "borderBottom": "1px solid separator",
  "titleStyle": "Title 1 (28/34, Bold)",
  "titleColor": "label",
  "largeTitleStyle": "Large Title (34/41, Bold)",
  "largeTitleColor": "label",
  "buttonSize": 44,
  "buttonIconSize": 22,
  "backButtonIconSize": 24,
  "backButtonInset": 8
}
```

### 6.2 Tab Bar
```json
{
  "height": 83,
  "heightCompact": 49,
  "background": "systemBackground",
  "borderTop": "1px solid separator",
  "itemSpacing": 0,
  "iconSize": 25,
  "iconSizeCompact": 22,
  "labelStyle": "Caption 1 (12/16, Regular)",
  "selectedLabelStyle": "Caption 1 (12/16, Semibold)",
  "selectedColor": "systemBlue",
  "unselectedColor": "tertiaryLabel",
  "badgeSize": 16,
  "badgeMinWidth": 16,
  "badgePaddingHorizontal": 4,
  "badgeStyle": "Caption 2 (11/13, Semibold)",
  "badgeColor": "systemBackground",
  "badgeBackground": "systemRed"
}
```

### 6.3 Buttons

#### Primary (Filled)
```json
{
  "height": 44,
  "paddingHorizontal": 16,
  "borderRadius": 12,
  "background": "systemBlue",
  "backgroundHighlighted": "systemBlue 80%",
  "backgroundDisabled": "systemBlue 40%",
  "labelStyle": "Body Emphasized (17/22, Semibold)",
  "labelColor": "white",
  "iconSize": 20,
  "iconGap": 8
}
```

#### Secondary (Tinted)
```json
{
  "height": 44,
  "paddingHorizontal": 16,
  "borderRadius": 12,
  "background": "systemBlue 15%",
  "backgroundHighlighted": "systemBlue 25%",
  "backgroundDisabled": "systemBlue 10%",
  "border": "none",
  "labelStyle": "Body Emphasized (17/22, Semibold)",
  "labelColor": "systemBlue",
  "labelColorDisabled": "systemBlue 40%"
}
```

#### Tertiary (Plain)
```json
{
  "height": 44,
  "paddingHorizontal": 8,
  "borderRadius": 8,
  "background": "transparent",
  "backgroundHighlighted": "tertiaryLabel 10%",
  "labelStyle": "Body Emphasized (17/22, Semibold)",
  "labelColor": "systemBlue",
  "labelColorDisabled": "systemBlue 40%"
}
```

#### Destructive
```json
{
  "background": "systemRed",
  "backgroundHighlighted": "systemRed 80%",
  "labelColor": "white"
}
```

#### Icon Button
```json
{
  "size": 44,
  "iconSize": 22,
  "borderRadius": 8,
  "backgroundHighlighted": "tertiaryLabel 10%"
}
```

### 6.4 Movie Card

#### Poster Card (Poster-focused)
```json
{
  "aspectRatio": "2:3",
  "borderRadius": 12,
  "imageRadius": 12,
  "imageCover": true,
  "shadow": "level-2",
  "gap": 8,
  "titleStyle": "Footnote Emphasized (13/18, Semibold)",
  "titleColor": "label",
  "titleLines": 2,
  "subtitleStyle": "Caption 1 (12/16, Regular)",
  "subtitleColor": "secondaryLabel",
  "ratingStyle": "Caption 1 (12/16, Semibold)",
  "ratingColor": "ratingGold",
  "ratingGap": 4,
  "ratingIconSize": 12,
  "genreStyle": "Caption 2 (11/13, Regular)",
  "genreColor": "tertiaryLabel",
  "genreGap": 4
}
```

#### Landscape Card (Landscape poster + info)
```json
{
  "height": 120,
  "imageWidth": 80,
  "imageAspectRatio": "2:3",
  "imageRadius": 8,
  "gap": 12,
  "padding": 8,
  "background": "secondarySystemBackground",
  "titleStyle": "Subheadline Emphasized (15/20, Semibold)",
  "titleLines": 2,
  "metaStyle": "Footnote (13/18, Regular)",
  "metaColor": "secondaryLabel",
  "metaGap": 6,
  "ratingStyle": "Footnote Emphasized (13/18, Semibold)",
  "ratingColor": "ratingGold"
}
```

#### Hero Banner (Hero section)
```json
{
  "height": 400,
  "minHeight": 350,
  "borderRadius": 0,
  "imageCover": true,
  "gradientOverlay": "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)",
  "padding": 24,
  "bottomPadding": 32,
  "titleStyle": "Title 1 (28/34, Bold)",
  "titleColor": "white",
  "titleLines": 3,
  "metaStyle": "Footnote (13/18, Regular)",
  "metaColor": "white 80%",
  "metaGap": 8,
  "ratingStyle": "Callout (16/21, Semibold)",
  "ratingColor": "ratingGold",
  "ratingIconSize": 16,
  "ratingGap": 6,
  "genresStyle": "Footnote (13/18, Regular)",
  "genresColor": "white 70%",
  "genresGap": 6,
  "actionGap": 12,
  "primaryActionStyle": "Primary Button",
  "secondaryActionStyle": "Secondary Button"
}
```

### 6.5 Section Header
```json
{
  "paddingHorizontal": 16,
  "paddingVertical": 8,
  "titleStyle": "Title 3 (20/25, Semibold)",
  "titleColor": "label",
  "actionStyle": "Footnote Emphasized (13/18, Semibold)",
  "actionColor": "systemBlue",
  "actionIconSize": 14,
  "actionGap": 4
}
```

### 6.6 Search Bar
```json
{
  "height": 36,
  "paddingHorizontal": 12,
  "borderRadius": 10,
  "background": "secondarySystemBackground",
  "backgroundFocused": "systemBackground",
  "iconSize": 18,
  "iconColor": "tertiaryLabel",
  "placeholderStyle": "Body (17/22, Regular)",
  "placeholderColor": "tertiaryLabel",
  "textStyle": "Body (17/22, Regular)",
  "textColor": "label",
  "clearButtonSize": 28,
  "clearButtonIconSize": 14,
  "cancelButtonStyle": "Body (17/22, Regular)",
  "cancelButtonColor": "systemBlue"
}
```

### 6.7 Filter Chips / Chips
```json
{
  "height": 32,
  "paddingHorizontal": 12,
  "borderRadius": 16,
  "gap": 6,
  "iconSize": 14,
  "labelStyle": "Footnote (13/18, Regular)",
  "selectedBackground": "systemBlue",
  "selectedLabelColor": "white",
  "unselectedBackground": "secondarySystemBackground",
  "unselectedLabelColor": "label",
  "unselectedBorder": "1px solid separator",
  "disabledOpacity": 0.4
}
```

### 6.8 Rating Stars
```json
{
  "starSize": 16,
  "starGap": 2,
  "filledColor": "ratingGold",
  "emptyColor": "ratingGray",
  "halfFillSupported": true,
  "labelStyle": "Footnote (13/18, Semibold)",
  "labelColor": "label",
  "labelGap": 6,
  "maxRating": 10,
  "displayPrecision": 0.5
}
```

### 6.9 Genre Pills
```json
{
  "height": 28,
  "paddingHorizontal": 12,
  "borderRadius": 14,
  "background": "tertiarySystemBackground",
  "labelStyle": "Caption 1 (12/16, Regular)",
  "labelColor": "secondaryLabel",
  "gap": 6,
  "selectedBackground": "systemBlue 15%",
  "selectedLabelColor": "systemBlue",
  "selectedBorder": "1px solid systemBlue"
}
```

### 6.10 Cast/crew Item
```json
{
  "imageSize": 80,
  "imageAspectRatio": "2:3",
  "imageRadius": 8,
  "gap": 8,
  "nameStyle": "Footnote Emphasized (13/18, Semibold)",
  "nameColor": "label",
  "nameLines": 2,
  "characterStyle": "Caption 1 (12/16, Regular)",
  "characterColor": "secondaryLabel",
  "characterLines": 1
}
```

### 6.11 Review Card
```json
{
  "padding": 16,
  "background": "secondarySystemBackground",
  "borderRadius": 12,
  "gap": 12,
  "avatarSize": 40,
  "avatarRadius": 20,
  "authorStyle": "Footnote Emphasized (13/18, Semibold)",
  "authorColor": "label",
  "metaStyle": "Caption 1 (12/16, Regular)",
  "metaColor": "tertiaryLabel",
  "ratingStyle": "Caption 1 (12/16, Semibold)",
  "ratingColor": "ratingGold",
  "contentStyle": "Footnote (13/18, Regular)",
  "contentColor": "label",
  "contentLines": 4,
  "expandStyle": "Footnote Emphasized (13/18, Semibold)",
  "expandColor": "systemBlue"
}
```

### 6.12 Sheet / Bottom Sheet
```json
{
  "handleWidth": 36,
  "handleHeight": 5,
  "handleRadius": 2.5,
  "handleColor": "tertiaryLabel",
  "handleMarginTop": 8,
  "handleMarginBottom": 16,
  "background": "systemBackground",
  "borderRadiusTop": 20,
  "shadow": "level-3",
  "detents": [280, 480, "large"],
  "contentPadding": 16
}
```

### 6.13 Modal / Alert
```json
{
  "maxWidth": 320,
  "padding": 20,
  "background": "systemBackground",
  "borderRadius": 16,
  "shadow": "level-4",
  "titleStyle": "Title 3 (20/25, Semibold)",
  "titleColor": "label",
  "messageStyle": "Body (17/22, Regular)",
  "messageColor": "label",
  "buttonHeight": 44,
  "buttonRadius": 12,
  "buttonGap": 8,
  "dividerColor": "separator"
}
```

### 6.14 Pull to Refresh
```json
{
  "height": 60,
  "spinnerSize": 24,
  "spinnerColor": "tertiaryLabel",
  "textStyle": "Footnote (13/18, Regular)",
  "textColor": "tertiaryLabel",
  "background": "systemBackground"
}
```

---

## 7. Screen Specifications

### 7.1 Home / Discover Screen

```
┌─────────────────────────────────────────┐
│ Navigation Bar (Large Title)            │
│ "Movies"                    [Search] [👤]│
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │        HERO BANNER (400pt)      │    │ ← Scrollable hero carousel
│  │  [Poster]  Title + Meta + Actions│    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Trending This Week        [See All] │ ← Section Header
│  └─────────────────────────────────┘    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │ ← Horizontal scroll (Poster Cards 2:3)
│  │ 🎬 │ │ 🎬 │ │ 🎬 │ │ 🎬 │ │ 🎬 │     │
│  └────┘ └────┘ └────┘ └────┘ └────┘     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Continue Watching         [See All] │
│  └─────────────────────────────────┘    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │ ← Landscape cards
│  │ 🎬  60%  │ │ 🎬  45%  │ │ 🎬  80%  │  │
│  └──────────┘ └──────────┘ └──────────┘  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Top Rated Movies            [See All] │
│  └─────────────────────────────────┘    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  │ 🎬 │ │ 🎬 │ │ 🎬 │ │ 🎬 │ │ 🎬 │     │
│  └────┘ └────┘ └────┘ └────┘ └────┘     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Genres                      [See All] │
│  └─────────────────────────────────┘    │
│  [🎬 Action] [🎭 Drama] [😱 Horror] ...  │ ← Horizontal chip scroll
│                                         │
└─────────────────────────────────────────┘
│ Tab Bar (5 tabs)                        │
│ [🏠 Home] [🔍 Search] [🎬 Watchlist]    │
│ [📺 Continue] [👤 Profile]              │
└─────────────────────────────────────────┘
```

**Specs:**
- Screen padding: 16 horizontal
- Section vertical gap: 24
- Section header padding: 16 horizontal, 8 vertical
- Horizontal scroll: 16 leading, 8 between cards, 16 trailing (peek next card)
- Hero carousel: full-width, page indicator dots (systemGray4/white), auto-scroll 5s
- Pull-to-refresh enabled

---

### 7.2 Movie Detail Screen

```
┌─────────────────────────────────────────┐
│ Navigation Bar (Translucent)            │
│ [← Back]                    [🔖] [⋯]   │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │       BACKDROP IMAGE (300pt)      │  │ ← Parallax scroll
│  │  [Gradient Overlay]               │  │
│  │                         [▶ Play]  │  │
│  │                         [📋 List]  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌────┐                                 │
│  │POST│  Title (Title 1, Bold)         │  ← Poster 120x180, radius 12
│  │ER  │  ⭐ 8.5/10  2024  R  2h 22m    │  ← Meta row (Footnote)
│  │    │  Action • Adventure • Sci-Fi   │  ← Genres (Footnote, tertiary)
│  └────┘                                 │
│                                         │
│  ────────────────────────────────────   │ ← Separator
│                                         │
│  OVERVIEW                    [More]     │ ← Section Header
│  "A thrilling journey through..."       │ ← Body, 4 lines max, expandable
│                                         │
│  ────────────────────────────────────   │
│                                         │
│  CAST & CREW                     [See All]│
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │ ← Horizontal scroll (Cast Items)
│  │ 👤 │ │ 👤 │ │ 👤 │ │ 👤 │ │ 👤 │    │
│  │Tom │ │Zen │ │... │ │... │ │... │    │
│  └────┘ └────┘ └────┘ └────┘ └────┘    │
│                                         │
│  ────────────────────────────────────   │
│                                         │
│  REVIEWS                        [See All]│
│  ┌─────────────────────────────────┐   │
│  │ 👤 John D.    ⭐⭐⭐⭐⭐  2d ago   │   │ ← Review Card
│  │ "Amazing visual effects..."     │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 👤 Sarah M.   ⭐⭐⭐⭐☆  1w ago    │   │
│  │ "Great story but pacing..."     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ────────────────────────────────────   │
│                                         │
│  SIMILAR MOVIES                  [See All]│
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│  │ 🎬 │ │ 🎬 │ │ 🎬 │ │ 🎬 │ │ 🎬 │    │
│  └────┘ └────┘ └────┘ └────┘ └────┘    │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Screen padding: 16 horizontal
- Backdrop height: 300 (collapses to nav bar on scroll)
- Poster: 120x180, radius 12, shadow level-2, offset -60 from backdrop bottom
- Title: Title 1 (28/34, Bold), max 2 lines
- Meta row: Footnote (13/18), secondaryLabel, icons 14pt
- Genres: Footnote, tertiaryLabel, pill chips
- Section gap: 24
- Horizontal scroll sections: 16 leading, 12 gap, 16 trailing
- Cast images: 80x120, radius 8

---

### 7.3 Search / Discover Screen

```
┌─────────────────────────────────────────┐
│ Navigation Bar                          │
│ "Search"                    [Cancel]    │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔍  Search movies, actors...    │   │ ← Search Bar (focused on load)
│  └─────────────────────────────────┘   │
│                                         │
│  RECENT SEARCHES                        │
│  ┌─────────────────────────────────┐   │
│  │ 🕐  Inception                   │   │ ← Recent search row
│  │ 🕐  Christopher Nolan           │   │
│  │ 🕐  Interstellar                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  TRENDING SEARCHES                      │
│  [🔥 Oppenheimer] [🔥 Barbie] [🔥 ...]  │ ← Trending chips
│                                         │
│  GENRES                                 │
│  [Action] [Comedy] [Drama] [Horror]...  │ ← Genre pills (2 rows)
│                                         │
└─────────────────────────────────────────┘
```

**Results State:**
```
┌─────────────────────────────────────────┐
│ Navigation Bar                          │
│ "Search Results"              [Cancel]  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ 🔍  Inception            [✕]   │   │ ← Search bar with clear
│  └─────────────────────────────────┘   │
│                                         │
│  FILTERS                    [Reset]     │ ← Filter row (horizontal scroll)
│  [🎬 Movies] [👤 People] [📺 Shows]     │
│  [Genre ▼] [Year ▼] [Rating ▼] [Sort ▼]│
│                                         │
│  1,234 Results                          │
│                                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │ ← Poster grid (2 columns)
│  │ 🎬 │ │ 🎬 │ │ 🎬 │ │ 🎬 │           │
│  │Ince│ │Int │ │Int │ │The │           │
│  └────┘ └────┘ └────┘ └────┘           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ 🎬 │ │ 🎬 │ │ 🎬 │ │ 🎬 │           │
│  └────┘ └────┘ └────┘ └────┘           │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Search bar: 36pt height, radius 10, focused on load
- Recent searches: grouped list, swipe to delete
- Trending: horizontal chip scroll
- Genres: 2-row grid, 6 per row
- Results grid: 2 columns, 16 gap, 16 screen padding
- Poster aspect: 2:3, radius 12
- Filter bar: sticky, horizontal scroll, chips 32pt height

---

### 7.4 Profile / Watchlist Screen

```
┌─────────────────────────────────────────┐
│ Navigation Bar (Large Title)            │
│ "Profile"                     [⚙️] [✏️] │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  👤 Avatar (80pt)               │   │
│  │  John Appleseed                 │   │ ← Title 2
│  │  @johnappleseed                 │   │ ← Subheadline
│  │  Joined Jan 2024                │   │ ← Footnote, tertiary
│  │                                 │   │
│  │  ┌─────────┐ ┌─────────┐       │   │
│  │ │  42  │   │ │  128  │       │   │ ← Stat pills
│  │ │Watchlist│  │Watched │       │   │
│  │ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Watchlist            [Sort ▼]   │   │ ← Section header with sort
│  └─────────────────────────────────┘   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │ ← Poster grid (2 col)
│  │ 🎬 │ │ 🎬 │ │ 🎬 │ │ 🎬 │          │
│  └────┘ └────┘ └────┘ └────┘          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Continue Watching      [See All]│   │
│  └─────────────────────────────────┘   │
│  ┌──────────┐ ┌──────────┐             │ ← Landscape cards
│  │ 🎬  60%  │ │ 🎬  45%  │             │
│  └──────────┘ └──────────┘             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Watched History         [See All]│   │
│  └─────────────────────────────────┘   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│  │ 🎬 │ │ 🎬 │ │ 🎬 │ │ 🎬 │          │
│  └────┘ └────┘ └────┘ └────┘          │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Avatar: 80pt, radius 40, brandPrimary border 2pt
- Stats: pill background secondarySystemBackground, radius 12, padding 12h 16v
- Stat value: Title 3 (20/25, Bold), label: Footnote, secondaryLabel
- Sections: grouped list style, 24 gap
- Watchlist grid: 2 columns, 16 gap
- Sort menu: bottom sheet with options (Recently Added, Title A-Z, Rating, Release Date)

---

### 7.5 Settings Sheet (from Profile)

```
┌─────────────────────────────────────────┐
│              [Handle Bar]               │
├─────────────────────────────────────────┤
│  SETTINGS                    [Done]     │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Account                    [>]  │   │ ← Navigation row
│  │ Notifications              [>]  │   │
│  │ Appearance                 [>]  │   │
│  │ Language                   [>]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Streaming Services         [>]  │   │
│  │ Download Quality           [>]  │   │
│  │ Auto-play Trailers         [⚙]  │   │ ← Toggle row
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Help & Support             [>]  │   │
│  │ Privacy Policy             [>]  │   │
│  │ Terms of Service           [>]  │   │
│  │ About                      [>]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Sign Out                      │   │ ← Destructive row
│  └─────────────────────────────────┘   │
│                                         │
│  Version 2.4.1 (Build 241)              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 8. Icon System (SF Symbols)

| Icon | SF Symbol | Size | Usage |
|------|-----------|------|-------|
| Search | `magnifyingglass` | 22 | Nav bar, search bar |
| User | `person.circle.fill` | 22 | Nav bar profile |
| Back | `chevron.left` | 24 | Nav bar back |
| More | `ellipsis.circle` | 22 | Nav bar overflow |
| Bookmark | `bookmark.fill` | 20 | Watchlist button |
| Bookmark Empty | `bookmark` | 20 | Watchlist empty |
| Play | `play.fill` | 20 | Play button |
| Play Circle | `play.circle.fill` | 44 | Hero play |
| List | `list.bullet` | 20 | Add to list |
| Star Fill | `star.fill` | 12-16 | Rating filled |
| Star Empty | `star` | 12-16 | Rating empty |
| Star Half | `star.leadinghalf.filled` | 12-16 | Half rating |
| Chevron Right | `chevron.right` | 14 | Navigation rows |
| Chevron Down | `chevron.down` | 14 | Dropdowns |
| Filter | `line.3.horizontal.decrease.circle` | 22 | Filter button |
| Genre | `film.stack` | 14 | Genre chips |
| Calendar | `calendar` | 14 | Release date |
| Clock | `clock` | 14 | Runtime |
| Tag | `tag.fill` | 14 | Rated badge |
| Person | `person.fill` | 14 | Cast |
| Ticket | `ticket.fill` | 14 | Reviews |
| Arrow Up/Down | `arrow.up.arrow.down` | 14 | Sort |
| Settings | `gearshape.fill` | 22 | Settings |
| Edit | `pencil` | 22 | Edit profile |
| Bell | `bell.fill` | 22 | Notifications |
| Moon | `moon.fill` | 22 | Dark mode |
| Globe | `globe` | 22 | Language |
| Question | `questionmark.circle.fill` | 22 | Help |
| Arrow Right Square | `arrow.right.square.fill` | 22 | Sign out |

---

## 9. Animation & Interaction

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| Nav push/pop | 350ms | easeInOut | iOS default |
| Tab switch | 250ms | easeOut | Crossfade |
| Button press | 100ms | easeOut | Scale 0.96 |
| Card press | 150ms | easeOut | Scale 0.98 + shadow level-1 |
| Sheet present | 300ms | easeOut | Spring 0.8, 0.6 |
| Sheet dismiss | 250ms | easeIn | Spring 0.8, 0.7 |
| Hero parallax | Scroll-linked | - | 0.5x scroll speed |
| Nav bar collapse | Scroll-linked | - | Large → inline at 80pt scroll |
| Pull to refresh | 200ms | easeOut | Spinner rotation |
| Chip select | 150ms | easeOut | Background color morph |
| Tab badge appear | 200ms | spring | Scale 0→1 |

---

## 10. Accessibility

- **Dynamic Type**: All text styles scale with system Dynamic Type (up to AX5)
- **VoiceOver**: All interactive elements have labels, hints, traits
- **Contrast**: All text meets WCAG AA (4.5:1) in both light/dark
- **Reduce Motion**: Disable parallax, spring animations, auto-scroll
- **Reduce Transparency**: Solid nav bars, no backdrop blur
- **Bold Text**: All text respects system bold setting
- **Touch Targets**: Minimum 44×44pt for all interactive elements
- **Focus**: Visible focus ring (systemBlue, 3pt) for keyboard/tvOS

---

## 11. Dark Mode Adaptations

| Element | Light | Dark |
|---------|-------|------|
| Hero gradient | 40%→80% black | 30%→90% black |
| Card background | secondarySystemBackground | secondarySystemBackground |
| Card shadow | level-2 | level-2 (darker) |
| Search bar bg | secondarySystemBackground | tertiarySystemBackground |
| Chip unselected bg | tertiarySystemBackground | secondarySystemBackground |
| Separator | separator | separator |
| Backdrop blur | systemMaterial | systemMaterialDark |

---

## 12. Responsive Breakpoints

| Size Class | Width | Layout Adjustments |
|------------|-------|-------------------|
| Compact (iPhone) | < 375 | 2-col poster grid, compact tab bar |
| Compact (iPhone Plus/Max) | 375-430 | 2-col poster grid, regular tab bar |
| Regular (iPad) | > 430 | 3-4 col poster grid, sidebar navigation, split view |

---

## 13. Implementation Notes (SwiftUI / React Native)

### SwiftUI Color Usage
```swift
Color(.label)
Color(.systemBackground)
Color(.secondarySystemBackground)
Color(.systemBlue)
Color(.systemRed)
Color("BrandPrimary") // #E50914
Color("RatingGold")   // #FFC107
```

### SwiftUI Font Usage
```swift
Font.system(.largeTitle, design: .default).bold()      // Large Title
Font.system(.title, design: .default).bold()           // Title 1
Font.system(.title2, design: .default).bold()          // Title 2
Font.system(.title3, design: .default).weight(.semibold) // Title 3
Font.system(.headline, design: .default)               // Headline
Font.system(.body, design: .default)                   // Body
Font.system(.body, design: .default).weight(.semibold) // Body Emphasized
Font.system(.callout, design: .default)                // Callout
Font.system(.subheadline, design: .default)            // Subheadline
Font.system(.subheadline, design: .default).weight(.semibold) // Subheadline Emphasized
Font.system(.footnote, design: .default)               // Footnote
Font.system(.footnote, design: .default).weight(.semibold) // Footnote Emphasized
Font.system(.caption, design: .default)                // Caption 1
Font.system(.caption2, design: .default)               // Caption 2
```

### Spacing Helpers
```swift
enum Spacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 24
    static let xxxl: CGFloat = 32
}
```

### Corner Radius Helpers
```swift
enum Radius {
    static let sm: CGFloat = 4
    static let md: CGFloat = 8
    static let lg: CGFloat = 12
    static let xl: CGFloat = 16
    static let xxl: CGFloat = 20
    static let full: CGFloat = 9999
}
```

---

## 14. Asset Requirements

| Asset | Sizes | Format | Notes |
|-------|-------|--------|-------|
| App Icon | 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024 | PNG | All iOS sizes |
| Launch Screen | 1125×2436, 1242×2688, 1290×2796, 1179×2556 | PNG | All device sizes |
| Movie Posters | 200×300 (thumb), 300×450 (card), 500×750 (detail), 1000×1500 (hero) | WebP/JPG | 2:3 aspect |
| Backdrops | 780×440, 1280×720, 1920×1080 | WebP/JPG | 16:9 aspect |
| Cast Photos | 200×300, 400×600 | WebP/JPG | 2:3 aspect |
| Genre Icons | 24×24, 48×48 | SF Symbols / PNG | Template rendering |

---

*Design System v1.0 — iOS Human Interface Guidelines compliant — Movie App*