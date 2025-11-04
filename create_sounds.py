import wave
import math
import struct
import random

def create_tone(frequency, duration, volume=0.5, sample_rate=44100):
    """Generate a simple tone"""
    n_frames = int(sample_rate * duration)
    audio = []
    for i in range(n_frames):
        # Simple sine wave
        sample = math.sin(2 * math.pi * frequency * i / sample_rate)
        # Convert to 16-bit integer
        audio.append(int(sample * 32767 * volume))
    return audio

def create_wave_file(filename, frequency=440, duration=0.1, volume=0.5, sample_rate=44100):
    """Create a simple WAV file"""
    audio = create_tone(frequency, duration, volume, sample_rate)
    
    # Write to WAV file
    with wave.open(filename, 'w') as wf:
        wf.setnchannels(1)  # Mono
        wf.setsampwidth(2)  # 2 bytes per sample (16-bit)
        wf.setframerate(sample_rate)
        
        # Pack the audio data
        packed_data = b''
        for sample in audio:
            packed_data += struct.pack('h', sample)
            
        wf.writeframes(packed_data)

# Create move sound - a short beep (880Hz, 50ms)
create_wave_file('sounds/move.wav', frequency=880, duration=0.05, volume=0.3)

# Create background music - a simple loopable tone (220Hz, 1 second)
create_wave_file('sounds/background.wav', frequency=220, duration=1.0, volume=0.1)

print("Sound files created successfully!")
