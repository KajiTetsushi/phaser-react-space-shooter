# Architecture

## Components

### Complex Objects

| Type         | Player     | Enemy 1    | Enemy 2   | Enemy 3    |
| ------------ | ---------- | ---------- | --------- | ---------- |
| **Input**    | Keyboard   | A.I. 1     | A.I. 2    | A.I. 3     |
| **Movement** | Horizontal | Horizontal | Horizonal | Horizontal |
|              |            |            | Vertical  | Vertical   |
| **Weapon**   | Upgradable | Blaster    | Blaster   | Plasma     |
| **Health**   | Health     | Health     | Health    | Health     |
| **Collider** | Collider   | Collider   | Collider  | Collider   |

### Events

Used by multiple components to notify other cmponents and systems. e.g.: enemy destroyed as a signal to play audio.

### Enemy Spawner

Creates new Enemy types

### Destruction Spawner

Uses event bus to create explosion game objects and animations
