#!/bin/bash

# Create sounds directory if it doesn't exist
mkdir -p sounds

# Download sound files
wget -O sounds/eat.mp3 https://www.educative.io/udata/wjlndLjW9o2/eat.mp3
wget -O sounds/gameover.wav https://www.educative.io/udata/GXrOnBangPm/game-over.mp3
#wget -O sounds/move.wav https://www.soundjay.com/buttons/sounds/button-09.wav
wget -O sounds/background.mp3 https://www.educative.io/udata/GXwd1r7RDJy/background-music.mp3

echo "Sound files downloaded to sounds/ directory"
