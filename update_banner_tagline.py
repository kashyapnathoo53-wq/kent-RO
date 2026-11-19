import os
from PIL import Image, ImageDraw, ImageFont

# 1. Base UHD text-free background plate with travertine floor, 4 purifiers, and water arcs
bg_path = os.path.join('images', 'kent_hero_bg_uhd_4k.jpg')
if not os.path.exists(bg_path):
    bg_path = os.path.join('images', 'kent_hero_background_clean_uhd.jpg')

base = Image.open(bg_path).convert('RGBA')
W, H = base.size

overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(overlay)

# Fonts
font_dm_path = 'fonts/DMSerifDisplay-Regular.ttf' if os.path.exists('fonts/DMSerifDisplay-Regular.ttf') else 'DMSerifDisplay-Regular.ttf'
font_arial_bold = r'C:\Windows\Fonts\arialbd.ttf'
font_segoe_bold = r'C:\Windows\Fonts\segoeuib.ttf'

scale = W / 1376.0

f_logo = ImageFont.truetype(font_arial_bold, int(54 * scale))
f_reg = ImageFont.truetype(font_arial_bold, int(21 * scale))
f_tag = ImageFont.truetype(font_segoe_bold, int(14 * scale))

f_head1 = ImageFont.truetype(font_dm_path, int(53 * scale))
f_head2 = ImageFont.truetype(font_dm_path, int(53 * scale))
f_sub = ImageFont.truetype(font_segoe_bold, int(15 * scale))
f_badge = ImageFont.truetype(font_segoe_bold, int(11 * scale))

LEFT_X = int(70 * scale)

# 1. Brand Logo: KENT® + HOUSE OF PURITY
draw.text((LEFT_X, int(65 * scale)), 'KENT', font=f_logo, fill=(255, 255, 255, 255))
bbox_kent = draw.textbbox((LEFT_X, int(65 * scale)), 'KENT', font=f_logo)
draw.text((bbox_kent[2] + int(4 * scale), int(67 * scale)), '®', font=f_reg, fill=(240, 240, 240, 255))

hop_text = 'HOUSE OF PURITY'
cur_x = LEFT_X + int(1 * scale)
hop_y = int(122 * scale)
for char in hop_text:
    draw.text((cur_x, hop_y), char, font=f_tag, fill=(195, 190, 185, 255))
    c_bbox = draw.textbbox((cur_x, hop_y), char, font=f_tag)
    cur_x = c_bbox[2] + int(5 * scale)

# 2. Headline Line 1: Mineral Technology
draw.text((LEFT_X, int(220 * scale)), 'Mineral Technology', font=f_head1, fill=(255, 255, 255, 255))

# 3. Headline Line 2: Pure Hydration (Champagne Gold Gradient)
text2 = 'Pure Hydration'
b2 = draw.textbbox((0, 0), text2, font=f_head2)
w2, h2 = b2[2] - b2[0], b2[3] - b2[1]

pad = int(5 * scale)
gold_grad = Image.new('RGBA', (w2 + pad * 2, h2 + pad * 2), (0, 0, 0, 0))
g_draw = ImageDraw.Draw(gold_grad)

stops = [
    (0.0, (212, 175, 115)),  # Brushed Champagne Gold
    (0.35, (238, 212, 165)), # Highlight Soft Gold
    (0.70, (218, 180, 120)), # Warm Amber Gold
    (1.0, (190, 150, 95))    # Deep Metallic Gold
]

for x in range(w2 + pad * 2):
    t = x / float(w2 + pad * 2)
    for i in range(len(stops) - 1):
        if stops[i][0] <= t <= stops[i+1][0]:
            factor = (t - stops[i][0]) / (stops[i+1][0] - stops[i][0])
            c0, c1 = stops[i][1], stops[i+1][1]
            break
    r = int(c0[0] + factor * (c1[0] - c0[0]))
    g = int(c0[1] + factor * (c1[1] - c0[1]))
    b = int(c0[2] + factor * (c1[2] - c0[2]))
    g_draw.line([(x, 0), (x, h2 + pad * 2)], fill=(r, g, b, 255))

mask = Image.new('L', (w2 + pad * 2, h2 + pad * 2), 0)
m_draw = ImageDraw.Draw(mask)
m_draw.text((pad - b2[0], pad - b2[1]), text2, font=f_head2, fill=255)

gold_text = Image.new('RGBA', (w2 + pad * 2, h2 + pad * 2), (0, 0, 0, 0))
gold_text.paste(gold_grad, (0, 0), mask)
overlay.paste(gold_text, (LEFT_X + b2[0] - pad, int(280 * scale) + b2[1] - pad), gold_text)

# 4. Subtitle: 100% PURE WATER • MINERAL RO™
draw.text((LEFT_X + int(1 * scale), int(370 * scale)), '100% PURE WATER • MINERAL RO™', font=f_sub, fill=(240, 240, 245, 255))

# 5. Four Feature Badges
badge_defs = [
    ('PREMIUM', 'QUALITY'),
    ('MAXIMUM', 'NUTRITION'),
    ('QUIET', 'OPERATION'),
    ('EASY TO', 'CLEAN')
]

BADGE_START_X = LEFT_X + int(5 * scale)
BADGE_GAP = int(105 * scale)
BADGE_Y = int(480 * scale)
R = int(20 * scale)

for i, (l1, l2) in enumerate(badge_defs):
    cx = BADGE_START_X + i * BADGE_GAP + R
    cy = BADGE_Y
    
    # Outer circle
    draw.ellipse([cx - R, cy - R, cx + R, cy + R], outline=(255, 255, 255, 210), width=max(1, int(1.5 * scale)))
    
    # Icons
    if i == 0:  # Checkmark
        pts = [(cx - int(7.5 * scale), cy - int(0.5 * scale)), (cx - int(2 * scale), cy + int(6 * scale)), (cx + int(8.5 * scale), cy - int(6 * scale))]
        draw.line(pts, fill=(255, 255, 255, 255), width=max(2, int(2 * scale)), joint='curve')
    elif i == 1:  # Battery/Nutrition
        draw.rounded_rectangle([cx - int(6.5 * scale), cy - int(9 * scale), cx + int(6.5 * scale), cy + int(9 * scale)], radius=int(2 * scale), outline=(255, 255, 255, 255), width=max(1, int(1.5 * scale)))
        draw.rectangle([cx - int(2.5 * scale), cy - int(11 * scale), cx + int(2.5 * scale), cy - int(9 * scale)], fill=(255, 255, 255, 255))
        l_pts = [(cx + int(1 * scale), cy - int(5.5 * scale)), (cx - int(3 * scale), cy + int(0.5 * scale)), (cx + int(0.5 * scale), cy + int(0.5 * scale)), (cx - int(1 * scale), cy + int(5.5 * scale)), (cx + int(3 * scale), cy - int(0.5 * scale)), (cx - int(0.5 * scale), cy - int(0.5 * scale))]
        draw.polygon(l_pts, fill=(255, 255, 255, 255))
    elif i == 2:  # Quiet Operation (Speaker)
        draw.polygon([(cx - int(8 * scale), cy - int(3.5 * scale)), (cx - int(4.5 * scale), cy - int(3.5 * scale)), (cx - int(1 * scale), cy - int(7.5 * scale)), (cx - int(1 * scale), cy + int(7.5 * scale)), (cx - int(4.5 * scale), cy + int(3.5 * scale)), (cx - int(8 * scale), cy + int(3.5 * scale))], fill=(255, 255, 255, 255))
        draw.arc([cx - int(1.5 * scale), cy - int(5 * scale), cx + int(5.5 * scale), cy + int(5 * scale)], start=-55, end=55, fill=(255, 255, 255, 255), width=max(1, int(1.5 * scale)))
        draw.arc([cx + int(1.5 * scale), cy - int(8.5 * scale), cx + int(10.5 * scale), cy + int(8.5 * scale)], start=-55, end=55, fill=(255, 255, 255, 255), width=max(1, int(1.5 * scale)))
    elif i == 3:  # Sparkle / Star (Easy to Clean)
        s_pts = [(cx, cy - int(9 * scale)), (cx + int(2 * scale), cy - int(2 * scale)), (cx + int(9 * scale), cy), (cx + int(2 * scale), cy + int(2 * scale)), (cx, cy + int(9 * scale)), (cx - int(2 * scale), cy + int(2 * scale)), (cx - int(9 * scale), cy), (cx - int(2 * scale), cy - int(2 * scale))]
        draw.polygon(s_pts, fill=(255, 255, 255, 255))
        as_pts = [(cx + int(6 * scale), cy - int(7 * scale)), (cx + int(6.5 * scale), cy - int(5.5 * scale)), (cx + int(8 * scale), cy - int(5 * scale)), (cx + int(6.5 * scale), cy - int(4.5 * scale)), (cx + int(6 * scale), cy - int(3 * scale)), (cx + int(5.5 * scale), cy - int(4.5 * scale)), (cx + int(4 * scale), cy - int(5 * scale)), (cx + int(5.5 * scale), cy - int(5.5 * scale))]
        draw.polygon(as_pts, fill=(255, 255, 255, 255))
    
    # Label 1 & Label 2
    b_l1 = draw.textbbox((0, 0), l1, font=f_badge)
    b_l2 = draw.textbbox((0, 0), l2, font=f_badge)
    w_l1 = b_l1[2] - b_l1[0]
    w_l2 = b_l2[2] - b_l2[0]
    
    draw.text((cx - w_l1 // 2, cy + R + int(9 * scale)), l1, font=f_badge, fill=(255, 255, 255, 240))
    draw.text((cx - w_l2 // 2, cy + R + int(23 * scale)), l2, font=f_badge, fill=(255, 255, 255, 240))
    
    # Vertical divider line
    if i < 3:
        div_x = cx + R + int(22.5 * scale)
        draw.line([(div_x, cy - int(17.5 * scale)), (div_x, cy + R + int(22.5 * scale))], fill=(255, 255, 255, 75), width=max(1, int(1 * scale)))

final_banner = Image.alpha_composite(base, overlay)
out_jpg = os.path.join('images', 'kent-purifiers-banner.jpg')
out_webp = os.path.join('images', 'kent-purifiers-banner.webp')

final_banner.convert('RGB').save(out_jpg, quality=98)
final_banner.convert('RGB').save(out_webp, 'WEBP', quality=95)
print(f"Successfully generated {out_webp} ({os.path.getsize(out_webp)} bytes) and {out_jpg} ({os.path.getsize(out_jpg)} bytes) at {W}x{H}!")
