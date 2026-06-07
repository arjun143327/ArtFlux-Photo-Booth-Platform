# Artflux – Product Requirement Document (V2)

## Product Vision

Artflux is a modern creative photo booth platform that transforms live camera feeds into artistic visual experiences using real-time rendering effects.

Rather than functioning as a traditional photo booth, Artflux acts as a creative photography studio where users can preview visual transformations live, capture stylized images, enhance them, and export them for sharing or printing.

The application combines photography, creative coding, and real-time visual effects into a premium user experience.

---

# Core User Journey

Open App
↓
Select Theme (Museum / Darkroom)
↓
Choose Effect
↓
See Real-Time Preview
↓
Adjust Intensity
↓
Capture Photo
↓
Preview Result
↓
Save / Export PDF / Share

---

# Theme System

## Museum Mode

Purpose:
Provide a bright, editorial, exhibition-inspired experience.

Characteristics:

* Warm off-white backgrounds
* Clean typography
* Minimal shadows
* Electric blue accents
* Orange highlights

Palette:

* Background: #F5F1E8
* Text: #111111
* Primary Accent: #0057FF
* Secondary Accent: #FF6B00

Design Inspiration:

* Modern museums
* Art galleries
* Design exhibitions
* Editorial websites

---

## Darkroom Mode

Purpose:
Provide a premium photography studio environment.

Characteristics:

* Dark interface
* Strong image focus
* Minimal distractions
* Gold accent highlights

Palette:

* Background: #0F0F10
* Surface: #18181B
* Text: #FAFAFA
* Accent: #EAB308

Design Inspiration:

* Leica
* VSCO
* Adobe Lightroom
* Professional photography studios

---

# Dashboard Layout

## Desktop Layout

Left Sidebar

* Logo
* Navigation
* Theme Switcher

Center Section

* Large Live Camera Preview
* Live Status Indicators
* Effect Overlay

Right Panel

* Effect Selection Grid
* Effect Controls
* Intensity Adjustment

Bottom Film Strip

* Recent Captures
* Quick Preview
* Delete Option

Capture Controls

* Center Capture Button
* Gallery Shortcut
* Camera Switch Option

---

# Core Features

## Real-Time Camera Preview

Users see effects applied before capturing photos.

Features:

* Webcam integration
* Live rendering
* Real-time updates
* Performance optimization

Target:
30+ FPS

---

## Visual Effect System

### ASCII Mode

Converts camera feed into text-based artwork.

Adjustable:

* Density
* Contrast
* Character Size

---

### Matrix Mode

Applies animated matrix-style rendering.

Adjustable:

* Character Density
* Glow Intensity

---

### Neon Edge Mode

Highlights edges using neon outlines.

Adjustable:

* Glow Strength
* Edge Detection Sensitivity

---

### Hologram Mode

Creates futuristic holographic visual effects.

Adjustable:

* Color Tint
* Scanline Intensity

---

### Particle Mode

Transforms subjects into particle-based compositions.

Adjustable:

* Particle Count
* Motion Strength

---

### CRT Retro Mode

Simulates vintage display aesthetics.

Adjustable:

* Noise
* Scanlines
* Distortion

---

# Effect Controls

Every effect must support:

* Live Preview
* Intensity Slider
* Reset Option
* Preset Selection

---

# Capture Workflow

When Capture is Pressed:

1. Freeze Frame
2. Generate High Resolution Output
3. Display Preview Modal

Preview Modal Actions:

* Save Image
* Export PDF
* Share
* Retake

---

# Gallery System

Film Strip Design

Features:

* Horizontal scrolling
* Recent captures
* Preview thumbnails
* Delete photos
* Reopen photos

No separate gallery dashboard is required.

---

# Export System

Supported Formats:

* PNG
* JPEG
* PDF

Export Options:

Save Image

* Standard Quality
* HD Quality

Save PDF

* Single Image PDF
* Multi Image PDF

Share

* WhatsApp
* Instagram
* Telegram
* Local Share

---

# Responsive Design

## Tablet

Layout:

* Camera Preview Top
* Effects Panel Bottom

## Mobile

Layout:

* Camera Preview
* Capture Controls
* Scrollable Effects Carousel

Bottom Navigation:

* Live
* Gallery
* Effects
* Settings

---

# Technical Stack

Frontend:

* React
* Tailwind CSS
* Framer Motion

Camera:

* Browser MediaDevices API

Image Processing:

* OpenCV.js

PDF Generation:

* jsPDF

State Management:

* Zustand

Deployment:

* Vercel

---

# MVP Scope

Included:

✓ Museum Mode
✓ Darkroom Mode
✓ Live Camera Preview
✓ ASCII Mode
✓ Neon Edge Mode
✓ CRT Retro Mode
✓ Capture System
✓ Film Strip Gallery
✓ PNG Export
✓ PDF Export
✓ Responsive Layout

Excluded:

✗ User Accounts
✗ Cloud Storage
✗ AI Face Segmentation
✗ Online Gallery
✗ Collaboration Features

---

# Success Metrics

Performance:

* 30+ FPS Preview
* Capture Time < 2 seconds

User Experience:

* Responsive on desktop and mobile
* One-click export
* Intuitive workflow

Design Goal:
Deliver a premium photography tool that feels closer to Leica, VSCO, and Lightroom than a traditional photo booth application.
