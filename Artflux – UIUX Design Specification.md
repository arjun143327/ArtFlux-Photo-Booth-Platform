# Artflux – UI/UX Design Specification

## Design Vision

Artflux is designed as a creative photography platform that blends the simplicity of a photo booth with the sophistication of professional photography software.

The interface prioritizes visual content over controls, ensuring that users remain focused on their creative output rather than navigating complex menus.

The design philosophy follows:

* Camera First
* Minimal Interface
* Real-Time Interaction
* Creative Exploration
* Premium Photography Experience

---

# Design Principles

## 1. Camera First

The live camera preview is the most important element of the application.

Design Goal:

* The camera preview should occupy the largest portion of the screen.
* Effects and controls should support the experience rather than compete with it.

Rule:
At least 60% of desktop screen space should be dedicated to the live preview.

---

## 2. Minimal Cognitive Load

Users should be able to understand the interface within seconds.

Design Goal:

* Reduce unnecessary options.
* Use recognizable icons.
* Keep navigation shallow.

Rule:
No action should require more than 2 clicks.

---

## 3. Creative Exploration

Users should feel encouraged to experiment.

Design Goal:

* Instant visual feedback.
* Smooth effect switching.
* Non-destructive editing.

Rule:
Every effect change must be reflected immediately in the preview.

---

## 4. Premium Feel

Artflux should feel like a professional creative tool.

Design Goal:

* Clean layouts.
* Consistent spacing.
* Refined typography.
* High-quality animations.

Inspiration:

* Leica
* VSCO
* Adobe Lightroom
* Arc Browser
* Apple Human Interface Guidelines

---

# Theme System

## Museum Mode (Light Theme)

Purpose:
Create an editorial and exhibition-inspired environment.

Characteristics:

* Bright
* Creative
* Modern
* Welcoming

Color Palette:

Background:
#F5F1E8

Surface:
#FFFFFF

Text:
#111111

Primary:
#0057FF

Secondary:
#FF6B00

Use Cases:

* Daytime use
* Public installations
* Creative showcases

---

## Darkroom Mode (Dark Theme)

Purpose:
Provide a focused professional workspace.

Characteristics:

* Immersive
* Elegant
* Photography-focused

Color Palette:

Background:
#0F0F10

Surface:
#18181B

Text:
#FAFAFA

Accent:
#EAB308

Use Cases:

* Creative sessions
* Studio environments
* Night usage

---

# Information Architecture

## Desktop Structure

Header

* Logo
* Theme Toggle
* Settings

Sidebar

* Live Camera
* Gallery
* Effects
* Templates
* Settings

Main Content

* Live Camera Preview

Effects Panel

* Effect Cards
* Effect Settings
* Intensity Controls

Bottom Film Strip

* Captured Images

Capture Controls

* Capture Button
* Camera Switch
* Upload Button

---

# Layout System

## Desktop

12-column grid

Structure:

Sidebar:
15%

Camera Preview:
55%

Effects Panel:
30%

Bottom Film Strip:
100%

---

## Tablet

Layout Flow:

Camera Preview
↓
Capture Controls
↓
Effects Panel
↓
Film Strip

---

## Mobile

Layout Flow:

Camera Preview
↓
Capture Button
↓
Effects Carousel
↓
Bottom Navigation

Bottom Navigation:

* Live
* Gallery
* Effects
* Settings

---

# Navigation Design

Navigation Style:
Permanent Sidebar (Desktop)

Collapsed Sidebar (Tablet)

Bottom Navigation (Mobile)

Navigation Behavior:

* Always visible
* Consistent icons
* Active state indicators

---

# Effect Selection UX

Effects are displayed as visual cards rather than text lists.

Each card contains:

* Thumbnail preview
* Effect name
* Active state

Available Effects:

* ASCII Mode
* Matrix Mode
* Neon Edge Mode
* Hologram Mode
* Particle Mode
* CRT Retro Mode

Selection Behavior:
Single click instantly applies effect.

No confirmation dialogs.

---

# Capture Experience

## Before Capture

User:

* Selects effect
* Adjusts intensity
* Sees real-time preview

---

## During Capture

System:

* Freeze frame animation
* Capture feedback animation

Duration:
Less than 500ms

---

## After Capture

Preview Modal Appears

Actions:

* Save Image
* Export PDF
* Share
* Delete
* Retake

---

# Gallery Experience

Design Pattern:
Film Strip

Reason:
Keeps users close to the camera workflow.

Features:

* Horizontal scrolling
* Quick preview
* Delete
* Reopen

Behavior:
Most recent image appears first.

---

# Typography System

Primary Typeface:
Inter

Fallback:
System Sans

Hierarchy:

H1:
32px

H2:
24px

H3:
18px

Body:
16px

Caption:
12px

Font Weight:
400
500
600
700

---

# Iconography

Style:
Outlined Icons

Recommended Libraries:

* Lucide Icons
* Heroicons

Guidelines:

* Consistent stroke width
* Minimal visual noise

---

# Component Design System

Border Radius:
16px

Button Radius:
12px

Spacing Scale:

4px
8px
12px
16px
24px
32px

Card Elevation:
Subtle shadow only

No excessive glow effects.

---

# Animation Guidelines

Duration:
150ms – 300ms

Animations:

Hover States
Card Selection
Capture Feedback
Theme Switching

Animation Style:
Smooth
Natural
Non-distracting

Library:
Framer Motion

---

# Accessibility

Minimum Contrast:
WCAG AA

Keyboard Navigation:
Supported

Focus States:
Visible

Touch Targets:
Minimum 44px

---

# User Experience Goals

Users should be able to:

* Open Artflux
* Select a visual effect
* Capture a photo
* Export the result

within 60 seconds without any instructions.

Success Metric:
A first-time user should understand the interface immediately and complete their first capture with minimal guidance.

---

# Design Statement

Artflux should feel like a modern creative studio where photography, technology, and digital art come together in a clean and immersive environment.
