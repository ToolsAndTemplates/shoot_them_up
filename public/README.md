# Space Shooter - Epic Shoot'em Up

A modern, engaging vertical shoot'em up game built with Next.js, TypeScript, and Phaser 3. Features stunning neon visuals, smooth gameplay, PWA support, and responsive controls for both desktop and mobile.

## Features

### Game Mechanics
- **Player Controls**: Smooth ship movement with keyboard (Arrow keys/WASD) or touch controls
- **Combat System**: Auto-firing bullets with satisfying collision detection
- **Enemy Waves**: Progressive difficulty with 3 enemy types (fast/weak, medium, slow/strong)
- **Powerup System**:
  - Blue Shield: Absorbs one hit
  - Green Speed Boost: Increases movement speed for 5 seconds
  - Pink Rapid Fire: Faster shooting for 5 seconds

### Visual Effects
- **Neon Aesthetic**: Cyberpunk-inspired color scheme with glow effects
- **Particle Systems**: Star field background, bullet trails, and explosions
- **Smooth Animations**: Tweened movements, fade effects, and scaling transitions
- **Responsive UI**: Score, health, and wave counter with real-time updates

### Technical Features
- **Next.js 15**: Modern React framework with App Router
- **TypeScript**: Full type safety throughout the codebase
- **Phaser 3**: Powerful game engine with arcade physics
- **Tailwind CSS**: Utility-first styling for the landing page
- **PWA Support**: Installable as a native app with offline capabilities
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Mobile Controls**: Touch-to-move with auto-fire functionality

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd shoot_them_up
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## How to Play

### Controls

**Desktop:**
- Arrow Keys or WASD: Move your ship
- Space: Shoot bullets
- ESC: Return to menu

**Mobile:**
- Touch/drag: Move your ship
- Auto-fire: Bullets fire automatically

### Objective

- Survive increasingly difficult enemy waves
- Collect powerups to enhance your abilities
- Achieve the highest score possible
- Complete waves to restore health

### Enemies

1. **Fast Enemy** (Pink): Quick but fragile - 1 HP
2. **Medium Enemy** (Purple): Balanced threat - 2 HP
3. **Heavy Enemy** (Cyan): Slow but tanky - 3 HP

### Powerups

- Powerups have a 15% chance to drop from defeated enemies
- Each powerup provides a unique advantage
- Strategic collection is key to surviving later waves

## Project Structure

```
shoot_them_up/
├── app/
│   ├── globals.css          # Global styles with neon theme
│   ├── layout.tsx            # Root layout with PWA config
│   └── page.tsx              # Landing page with menu
├── components/
│   ├── Game.tsx              # Phaser game wrapper
│   └── GameScene.ts          # Main game logic and mechanics
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── icon.svg              # Custom spaceship icon
│   └── icon-*.png            # PWA icons
├── next.config.js            # Next.js + PWA configuration
├── tailwind.config.ts        # Tailwind theme customization
└── tsconfig.json             # TypeScript configuration
```

## Key Technologies

- **Next.js 15.0.3**: React framework
- **React 18.3.1**: UI library
- **TypeScript 5**: Type safety
- **Phaser 3.87.0**: Game engine
- **Tailwind CSS 3.4**: Styling
- **next-pwa 5.6.0**: PWA capabilities

## Performance Optimizations

- Dynamic imports for Phaser (client-side only)
- Arcade physics engine (lightweight)
- Object pooling for bullets and enemies
- Automatic cleanup of off-screen objects
- Responsive canvas scaling

## Future Enhancements

- [ ] Sound effects and background music
- [ ] High score persistence (localStorage/database)
- [ ] Additional enemy types and boss battles
- [ ] Multiple weapon types
- [ ] Achievement system
- [ ] Multiplayer mode
- [ ] Level system with different backgrounds

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with WebGL support

## PWA Installation

The game can be installed as a Progressive Web App:

1. Visit the game in a supported browser
2. Look for the "Install" prompt or option in the browser menu
3. Click "Install" to add it to your home screen/desktop
4. Launch the game as a native app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or personal use.

## Acknowledgments

- Built with Phaser 3 game engine
- Inspired by classic shoot'em up games
- Neon aesthetic inspired by cyberpunk design

---

Enjoy defending the galaxy from alien invaders!
