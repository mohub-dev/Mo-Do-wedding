import os
import math
import wave
import struct
import subprocess
import shutil

WIDTH = 1280
HEIGHT = 720

def get_olive_branch_svg(x, y, scale=1.0, rotate=0, opacity=0.9):
    # Generates detailed botanical watercolor olive branch with leaves and olives
    return f"""
    <g transform="translate({x}, {y}) scale({scale}) rotate({rotate})" opacity="{opacity}">
      <!-- Stem -->
      <path d="M 0,0 Q 60,-20 120,-10 T 220,-30 T 320,-20" fill="none" stroke="#4A5643" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 120,-10 Q 150,-50 180,-70" fill="none" stroke="#4A5643" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M 220,-30 Q 250,-70 270,-90" fill="none" stroke="#4A5643" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 60,-20 Q 80,10 100,25" fill="none" stroke="#4A5643" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M 180,-20 Q 200,5 220,15" fill="none" stroke="#4A5643" stroke-width="1.5" stroke-linecap="round"/>
      
      <!-- Leaves -->
      <!-- Leaf 1 -->
      <path d="M 50,-18 Q 70,-45 105,-40 Q 80,-25 50,-18 Z" fill="#607259" opacity="0.85"/>
      <path d="M 50,-18 Q 75,-30 105,-40" fill="none" stroke="#3D4A37" stroke-width="0.8"/>
      
      <!-- Leaf 2 -->
      <path d="M 80,-14 Q 110,-5 135,15 Q 105,5 80,-14 Z" fill="#788A71" opacity="0.8"/>
      <path d="M 80,-14 Q 105,0 135,15" fill="none" stroke="#4B5844" stroke-width="0.7"/>

      <!-- Leaf 3 (Soft Sage) -->
      <path d="M 120,-10 Q 150,-35 185,-30 Q 155,-15 120,-10 Z" fill="#8B9C83" opacity="0.85"/>
      <path d="M 120,-10 Q 155,-22 185,-30" fill="none" stroke="#4B5844" stroke-width="0.7"/>

      <!-- Branch 1 Leaves -->
      <path d="M 150,-40 Q 140,-75 160,-90 Q 165,-60 150,-40 Z" fill="#6A7C63" opacity="0.85"/>
      <path d="M 170,-60 Q 190,-85 215,-95 Q 195,-70 170,-60 Z" fill="#7E8F77" opacity="0.8"/>
      <path d="M 180,-70 Q 205,-90 230,-98 Q 208,-78 180,-70 Z" fill="#586A51" opacity="0.9"/>

      <!-- Leaf 4 -->
      <path d="M 170,-22 Q 200,-5 235,5 Q 200,-15 170,-22 Z" fill="#84957D" opacity="0.85"/>
      
      <!-- Leaf 5 -->
      <path d="M 220,-30 Q 250,-55 285,-50 Q 255,-35 220,-30 Z" fill="#5E7057" opacity="0.88"/>
      
      <!-- Branch 2 Leaves -->
      <path d="M 250,-70 Q 275,-95 305,-105 Q 280,-80 250,-70 Z" fill="#75876E" opacity="0.85"/>
      <path d="M 270,-90 Q 295,-115 325,-120 Q 300,-100 270,-90 Z" fill="#63755C" opacity="0.9"/>

      <!-- Tip Leaves -->
      <path d="M 280,-25 Q 310,-40 345,-38 Q 315,-25 280,-25 Z" fill="#7A8C73" opacity="0.85"/>
      <path d="M 320,-20 Q 350,-25 380,-22 Q 350,-12 320,-20 Z" fill="#5A6C53" opacity="0.9"/>

      <!-- Olive fruits -->
      <ellipse cx="115" cy="5" rx="7" ry="11" transform="rotate(25 115 5)" fill="#3B4636" opacity="0.9"/>
      <ellipse cx="113" cy="3" rx="2" ry="4" transform="rotate(25 113 3)" fill="#8A9983" opacity="0.6"/>
      <ellipse cx="210" cy="-8" rx="6.5" ry="10" transform="rotate(-15 210 -8)" fill="#354030" opacity="0.9"/>
      <ellipse cx="208" cy="-10" rx="2" ry="3.5" transform="rotate(-15 208 -10)" fill="#8A9983" opacity="0.6"/>
    </g>
    """

def get_paper_texture_svg(width, height, color="#FAF8F5", grain_opacity=0.03):
    return f"""
    <rect width="{width}" height="{height}" fill="{color}"/>
    <filter id="paper-texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.3   0 0 0 0 0.35   0 0 0 0 0.28  0 0 0 {grain_opacity} 0"/>
      <feComposite in2="SourceGraphic" in="glint" operator="atop"/>
    </filter>
    <rect width="{width}" height="{height}" fill="#404B3B" opacity="{grain_opacity}"/>
    """

def generate_closed_envelope_svg():
    # Warm beige ambient surface
    # Centered sage green envelope tilted slightly with soft shadow
    # Cord bow in center
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <radialGradient id="ambient-light" cx="45%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#F7F5EE"/>
      <stop offset="60%" stop-color="#EBE7DE"/>
      <stop offset="100%" stop-color="#DDD8CD"/>
    </radialGradient>
    <filter id="envelope-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="15" dy="25" stdDeviation="22" flood-color="#2D3528" flood-opacity="0.32"/>
      <feDropShadow dx="4" dy="8" stdDeviation="8" flood-color="#1A2016" flood-opacity="0.2"/>
    </filter>
    <filter id="flap-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#1E261B" flood-opacity="0.25"/>
    </filter>
    <filter id="cord-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#10150E" flood-opacity="0.4"/>
    </filter>
    <pattern id="washi-fibers" width="180" height="180" patternUnits="userSpaceOnUse">
      <path d="M20,30 Q40,35 60,32" stroke="#FAF8F5" stroke-width="0.8" opacity="0.35" fill="none"/>
      <path d="M90,70 Q110,65 130,75" stroke="#FAF8F5" stroke-width="0.6" opacity="0.3" fill="none"/>
      <path d="M40,120 Q65,130 90,122" stroke="#FAF8F5" stroke-width="0.7" opacity="0.35" fill="none"/>
      <path d="M120,150 Q145,145 160,155" stroke="#FAF8F5" stroke-width="0.5" opacity="0.25" fill="none"/>
      <path d="M10,90 Q30,105 45,95" stroke="#424D3E" stroke-width="0.6" opacity="0.25" fill="none"/>
      <path d="M130,25 Q150,40 170,30" stroke="#424D3E" stroke-width="0.5" opacity="0.2" fill="none"/>
    </pattern>
  </defs>

  <!-- Ambient Surface -->
  <rect width="1280" height="720" fill="url(#ambient-light)"/>

  <!-- Subtle background loose olive sprigs -->
  {get_olive_branch_svg(80, 100, scale=0.6, rotate=-35, opacity=0.35)}
  {get_olive_branch_svg(1150, 620, scale=0.7, rotate=150, opacity=0.35)}
  
  <!-- Envelope Container with gentle angle -->
  <g transform="translate(640, 360) rotate(-4) translate(-640, -360)">
    <!-- Envelope Body -->
    <g filter="url(#envelope-shadow)">
      <rect x="330" y="160" width="620" height="400" rx="6" fill="#75856F"/>
      <rect x="330" y="160" width="620" height="400" rx="6" fill="url(#washi-fibers)"/>
      <!-- Soft paper highlight & gradient -->
      <path d="M330,160 L950,160 L950,560 L330,560 Z" fill="none" stroke="#8C9C86" stroke-width="1.5" opacity="0.6"/>
    </g>

    <!-- Lower Flaps Seams -->
    <path d="M330,560 L640,370 L950,560" fill="#6B7A65" stroke="#5E6D58" stroke-width="1.2"/>
    <path d="M330,160 L640,370 L330,560" fill="#70806A" stroke="#5E6D58" stroke-width="1"/>
    <path d="M950,160 L640,370 L950,560" fill="#70806A" stroke="#5E6D58" stroke-width="1"/>

    <!-- Top Triangular Flap Closed -->
    <g filter="url(#flap-shadow)">
      <path d="M330,160 L640,380 L950,160 Z" fill="#7A8A73"/>
      <path d="M330,160 L640,380 L950,160 Z" fill="url(#washi-fibers)"/>
      <path d="M330,160 L640,380 L950,160" fill="none" stroke="#8E9F88" stroke-width="1.8"/>
      <path d="M330,160 L640,380 L950,160" fill="none" stroke="#586653" stroke-width="1" opacity="0.6"/>
    </g>

    <!-- Olive Green Twine / String Wrapped & Bow Knot -->
    <g filter="url(#cord-shadow)">
      <!-- Horizontal wrapped cord -->
      <path d="M330,360 Q640,362 950,360" fill="none" stroke="#485542" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M330,360 Q640,362 950,360" fill="none" stroke="#5C6C55" stroke-width="1.5" stroke-linecap="round"/>

      <!-- Tied Bow Knot in Center (x=640, y=362) -->
      <!-- Left Bow Loop -->
      <path d="M 640,362 C 610,335 560,330 565,360 C 570,385 620,375 640,362 Z" fill="none" stroke="#485542" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M 640,362 C 610,335 560,330 565,360 C 570,385 620,375 640,362 Z" fill="none" stroke="#63745C" stroke-width="1.5"/>

      <!-- Right Bow Loop -->
      <path d="M 640,362 C 670,335 720,330 715,360 C 710,385 660,375 640,362 Z" fill="none" stroke="#485542" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M 640,362 C 670,335 720,330 715,360 C 710,385 660,375 640,362 Z" fill="none" stroke="#63745C" stroke-width="1.5"/>

      <!-- Hanging Cord Tails -->
      <path d="M 638,364 Q 615,405 590,440" fill="none" stroke="#485542" stroke-width="3" stroke-linecap="round"/>
      <path d="M 642,364 Q 660,415 675,450" fill="none" stroke="#485542" stroke-width="3" stroke-linecap="round"/>
      <path d="M 638,364 Q 615,405 590,440" fill="none" stroke="#63745C" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M 642,364 Q 660,415 675,450" fill="none" stroke="#63745C" stroke-width="1.4" stroke-linecap="round"/>

      <!-- Center Knot -->
      <ellipse cx="640" cy="362" rx="6" ry="5.5" fill="#3D4937"/>
      <ellipse cx="639" cy="361" rx="3" ry="2.5" fill="#6A7C63"/>
    </g>
  </g>
</svg>"""

def generate_opened_card_svg():
    # Warm beige surface
    # Open envelope at back
    # Centered Ivory Card with botanical watercolor branches and calligraphy
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <radialGradient id="bg-glow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#F8F6F0"/>
      <stop offset="60%" stop-color="#ECE8DF"/>
      <stop offset="100%" stop-color="#DDD8CE"/>
    </radialGradient>
    <filter id="card-shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#2D3528" flood-opacity="0.28"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#1A2016" flood-opacity="0.15"/>
    </filter>
    <filter id="envelope-back-shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#232B20" flood-opacity="0.32"/>
    </filter>
    <pattern id="card-fibers" width="220" height="220" patternUnits="userSpaceOnUse">
      <path d="M30,40 Q55,45 80,42" stroke="#DED9CE" stroke-width="0.8" opacity="0.45" fill="none"/>
      <path d="M120,90 Q145,85 170,95" stroke="#DED9CE" stroke-width="0.6" opacity="0.4" fill="none"/>
      <path d="M60,160 Q85,170 110,162" stroke="#DED9CE" stroke-width="0.7" opacity="0.45" fill="none"/>
    </pattern>
  </defs>

  <!-- Ambient Surface -->
  <rect width="1280" height="720" fill="url(#bg-glow)"/>

  <!-- Loose drifting olive leaves in background -->
  <g transform="translate(180, 220) rotate(42) scale(0.65)">
    <path d="M0,0 Q25,-15 50,-5 Q25,12 0,0 Z" fill="#6B7D64" opacity="0.65"/>
  </g>
  <g transform="translate(220, 520) rotate(-28) scale(0.55)">
    <path d="M0,0 Q25,-15 50,-5 Q25,12 0,0 Z" fill="#84967C" opacity="0.6"/>
  </g>
  <g transform="translate(1080, 160) rotate(-45) scale(0.6)">
    <path d="M0,0 Q25,-15 50,-5 Q25,12 0,0 Z" fill="#75876E" opacity="0.6"/>
  </g>
  <g transform="translate(1050, 480) rotate(35) scale(0.7)">
    <path d="M0,0 Q25,-15 50,-5 Q25,12 0,0 Z" fill="#5F7058" opacity="0.65"/>
  </g>

  <!-- Opened Sage Green Envelope in Background -->
  <g transform="translate(640, 390) translate(-640, -390)" filter="url(#envelope-back-shadow)">
    <!-- Flap Open Pointing Upwards -->
    <path d="M 330, 240 L 640, 60 L 950, 240 Z" fill="#697963"/>
    <path d="M 330, 240 L 640, 60 L 950, 240" fill="none" stroke="#7E8F77" stroke-width="1.5" opacity="0.6"/>
    <!-- Envelope Lower Pocket -->
    <rect x="330" y="240" width="620" height="380" rx="6" fill="#73836D"/>
    <!-- Inner Dark Lining -->
    <path d="M 340, 250 L 640, 420 L 940, 250 L 940, 610 L 340, 610 Z" fill="#5B6A56"/>
  </g>

  <!-- Ivory Wedding Invitation Card Centered -->
  <g filter="url(#card-shadow)">
    <!-- Card Base -->
    <rect x="290" y="100" width="700" height="490" rx="8" fill="#FAF8F5"/>
    <rect x="290" y="100" width="700" height="490" rx="8" fill="url(#card-fibers)"/>
    <!-- Inner delicate frame border -->
    <rect x="310" y="120" width="660" height="450" rx="4" fill="none" stroke="#8E9E88" stroke-width="0.75" opacity="0.4"/>

    <!-- Botanical Watercolor Branches in Corners -->
    <!-- Top-Left Corner Foliage -->
    {get_olive_branch_svg(285, 95, scale=0.9, rotate=30, opacity=0.92)}
    {get_olive_branch_svg(315, 125, scale=0.6, rotate=-10, opacity=0.75)}

    <!-- Bottom-Right Corner Foliage -->
    {get_olive_branch_svg(995, 595, scale=0.9, rotate=210, opacity=0.92)}
    {get_olive_branch_svg(965, 565, scale=0.6, rotate=170, opacity=0.75)}

    <!-- Typography: Centered Calligraphy -->
    <!-- 'دعوة زفاف' -->
    <g transform="translate(640, 250)">
      <text x="0" y="0" text-anchor="middle" font-family="'Amiri', 'Amiri Quran', 'Noto Serif Arabic', 'KacstTitle', serif" font-size="34" font-weight="bold" fill="#3D4A38" letter-spacing="1">دعوة زفاف</text>
      <!-- Subtle flourish underneath -->
      <path d="M -45,15 Q 0,25 45,15" fill="none" stroke="#7A8B74" stroke-width="1.2" opacity="0.7" stroke-linecap="round"/>
      <circle cx="0" cy="20" r="2" fill="#7A8B74"/>
    </g>

    <!-- 'محمد & دنيا' (Grand, Majestic Calligraphy) -->
    <g transform="translate(640, 365)">
      <text x="0" y="0" text-anchor="middle" font-family="'Amiri', 'Noto Serif Arabic', 'KacstDecorative', 'Aref Ruqaa', serif" font-size="64" font-weight="bold" fill="#242E20">محمد &amp; دنيا</text>
      <!-- Calligraphic accent lines -->
      <path d="M -160,35 C -80,50 80,50 160,35" fill="none" stroke="#5F7057" stroke-width="1.6" opacity="0.65" stroke-linecap="round"/>
      <circle cx="-160" cy="35" r="2.5" fill="#5F7057"/>
      <circle cx="160" cy="35" r="2.5" fill="#5F7057"/>
      <circle cx="0" cy="46" r="3" fill="#5F7057"/>
    </g>
  </g>
</svg>"""

def build_audio(output_wav):
    sample_rate = 44100
    duration = 8.5
    num_samples = int(sample_rate * duration)
    
    with wave.open(output_wav, "w") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        
        # Elegant acoustic harp / chime sequence
        notes = [
            (0.15, 523.25),  # C5
            (0.55, 659.25),  # E5
            (0.95, 783.99),  # G5
            (1.35, 987.77),  # B5
            (1.85, 1046.50), # C6
            (2.40, 880.00),  # A5
            (3.10, 783.99),  # G5
            (3.90, 659.25),  # E5
            (4.70, 587.33),  # D5
            (5.50, 523.25),  # C5
            (6.20, 783.99),  # G5
            (6.90, 1046.50)  # C6
        ]
        
        frames = bytearray()
        for i in range(num_samples):
            t = i / sample_rate
            val = 0.0
            
            # Warm soothing acoustic pad
            pad = math.sin(2 * math.pi * 130.81 * t) * 0.08 + math.sin(2 * math.pi * 196.0 * t) * 0.05
            pad_env = min(t / 1.2, 1.0) * max(0.0, (duration - t) / 1.5)
            val += pad * pad_env
            
            for start_t, freq in notes:
                if t >= start_t:
                    dt = t - start_t
                    env = math.exp(-dt * 1.7)
                    s = math.sin(2 * math.pi * freq * dt) * 0.28
                    s += math.sin(2 * math.pi * freq * 2 * dt) * 0.12 * math.exp(-dt * 3.0)
                    s += math.sin(2 * math.pi * freq * 3 * dt) * 0.04 * math.exp(-dt * 4.5)
                    val += s * env
                    
            val = max(-1.0, min(1.0, val * 0.85))
            int_val = int(val * 30000)
            frames.extend(struct.pack("<hh", int_val, int_val))
            
        wav.writeframes(frames)
    print("Built audio track:", output_wav)

def main():
    os.makedirs("public/assets", exist_ok=True)
    os.makedirs("scripts/temp_frames", exist_ok=True)

    # 1. Closed Envelope SVG & PNG
    closed_svg_path = "public/assets/closed_envelope.svg"
    closed_png_path = "public/assets/closed_envelope.png"
    with open(closed_svg_path, "w") as f:
        f.write(generate_closed_envelope_svg())
    subprocess.run(["ffmpeg", "-y", "-i", closed_svg_path, closed_png_path], check=True)
    print("Generated:", closed_png_path)

    # 2. Opened Card SVG & PNG
    opened_svg_path = "public/assets/invitation_card.svg"
    opened_png_path = "public/assets/invitation_card.png"
    with open(opened_svg_path, "w") as f:
        f.write(generate_opened_card_svg())
    subprocess.run(["ffmpeg", "-y", "-i", opened_svg_path, opened_png_path], check=True)
    print("Generated:", opened_png_path)

    # 3. Audio track
    audio_wav_path = "public/assets/invitation_audio.wav"
    build_audio(audio_wav_path)

    # 4. Generate 8.5s Video from the sequence
    # Stage 0: 0.0s - 1.5s -> Closed envelope
    # Stage 1: 1.5s - 4.0s -> Opening transition (crossfade with leaf motion)
    # Stage 2: 4.0s - 8.5s -> Full invitation card
    # Let's create video with ffmpeg using xfade & audio
    video_mp4_path = "public/assets/invitation_video.mp4"
    
    # We will build a smooth cinematic video with libx264 and AAC audio:
    # Closed image (3s) -> crossfade (1.5s) -> Opened card (5.5s) = 8.5s total
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-t", "3.0", "-i", closed_png_path,
        "-loop", "1", "-t", "6.5", "-i", opened_png_path,
        "-i", audio_wav_path,
        "-filter_complex",
        "[0:v][1:v]xfade=transition=fade:duration=1.5:offset=2.0,format=yuv420p[v]",
        "-map", "[v]",
        "-map", "2:a",
        "-c:v", "libx264",
        "-crf", "18",
        "-preset", "medium",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", "8.5",
        "-pix_fmt", "yuv420p",
        video_mp4_path
    ]
    subprocess.run(cmd, check=True)
    print("Generated video:", video_mp4_path)

if __name__ == "__main__":
    main()
