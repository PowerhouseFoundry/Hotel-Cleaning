# Powerhouse Hotel Room Cleaning Game v2.1

Static training game for West SILC Powerhouse. No Firebase, npm or local server is required.

## Run the learner game
Open `index.html` in Chrome, Edge or Safari. It is designed to work from `file://` and does not use canvas pixel-reading.

## Artwork Manager
Open `admin.html`.

The Artwork Manager lists the core artwork, exact expected filenames and image-generation prompts. In Chrome/Edge, use **Connect project folder** and choose this main project folder. After that, Upload can write a selected image directly to the correct `assets/...` location. If direct folder access is unavailable, the manager downloads the image using the correct filename and tells you which folder to place it in.

## New v2 game structure
The old single-image overlay approach has been replaced by a hub-and-mini-game structure:

- Main Room Hub
- Make the Bed (near-birds-eye)
- Hoover the Floor (dedicated top-down room plan, 1-4 random dirt areas)
- Clean the Desk (high-angle desk view, wipe + return objects)
- Laundry Caddy (large drop target)

The learner interface remains one-action-at-a-time with large forgiving targets and minimal words.

## Current artwork
The project includes the approved/generated main room artwork plus supplied room photographs as initial scene artwork so the prototype works immediately. The Artwork Manager prompts are intended for replacing those scene photographs with a consistent slightly stylised game-art set.

## Important
Do not add dirty objects permanently to the main hub artwork. Dirt, linen and task states belong inside their dedicated mini-games.


V2.1 artwork update:
- Bed mini-game now uses the new birds-eye bare-mattress room artwork with the housekeeping caddy fixed at the right.
- Hoover mini-game now uses the new birds-eye made-bed room artwork with no caddy, replacing the previous CSS floor-plan mock-up.
- Existing interaction logic is preserved for this artwork pass.
