let handImg;
let leafImg;
let cardContainer;
let handBounds = { x: 0, y: 0, w: 0, h: 0 };
let isHoveringClover = false;
let isHoveringCard = false;
let cardHasBeenHovered = false;

// Clover rain state
let clovers = [];
let isRaining = false;
let handOpacity = 255;
let sentEmail = '';
let showSuccessMessage = false;

// Sparkle particles state
let sparkles = [];

// Pre-rendered clover for performance
let cloverGraphic;

function preload() {
  handImg = loadImage('assets/hand-clover.png');
  leafImg = loadImage('assets/leaf-left.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cardContainer = document.getElementById('cardContainer');
  frameRate(60);

  // Pre-render clover emoji to graphics buffer for performance
  cloverGraphic = createGraphics(50, 50);
  cloverGraphic.textSize(40);
  cloverGraphic.textAlign(CENTER, CENTER);
  cloverGraphic.text('🍀', 25, 25);

  // Add hover listeners to card
  if (cardContainer) {
    cardContainer.addEventListener('mouseenter', () => {
      isHoveringCard = true;
      cardHasBeenHovered = true;
    });
    cardContainer.addEventListener('mouseleave', () => {
      isHoveringCard = false;
      // Only slide out if card has been hovered and we're not on clover
      if (cardHasBeenHovered && !isHoveringClover) {
        cardContainer.classList.remove('visible');
        cardHasBeenHovered = false;
      }
    });
  }

  // Add click listener to submit button
  let submitBtn = document.querySelector('.submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmit);
  }
}

function handleSubmit() {
  let emailInput = document.getElementById('emailInput');
  let email = emailInput ? emailInput.value : '';

  if (email) {
    sentEmail = email;
    isRaining = true;
    showSuccessMessage = true;

    // Hide the card
    if (cardContainer) {
      cardContainer.classList.remove('visible');
    }

    // Start spawning clovers
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        spawnClover();
      }, i * 50);
    }
  }
}

function spawnClover() {
  clovers.push({
    x: random(width),
    y: -50,
    size: random(24, 40),
    rotation: random(TWO_PI),
    rotationSpeed: random(-0.15, 0.15),
    speedY: random(15, 25),
    speedX: random(-2, 2)
  });
}

function spawnSparkle() {
  // Spawn sparkle within a tighter area around the clover center
  let x = handBounds.x + handBounds.w * 0.45 + random(handBounds.w * 0.4);
  let y = handBounds.y + random(handBounds.h * 0.5);

  sparkles.push({
    x: x,
    y: y,
    size: random(3, 8),
    opacity: 255,
    speedY: random(-1.5, -3),
    speedX: random(-0.5, 0.5),
    rotation: random(TWO_PI),
    rotationSpeed: random(-0.1, 0.1),
    fadeRate: random(3, 6)
  });
}

function draw() {
  // Background color
  background(45, 56, 64); // #2D3840

  // Draw leaf shadows
  drawLeafShadows();

  // Draw hand image with opacity
  drawHand();

  // Draw sparkles (behind and around the clover)
  drawSparkles();

  // Spawn sparkles while hovering clover
  if (isHoveringClover && !showSuccessMessage && random() < 0.4) {
    spawnSparkle();
  }

  // Draw clover rain
  if (isRaining) {
    drawCloverRain();

    // Fade out hand
    if (handOpacity > 0) {
      handOpacity -= 5;
    }
  }

  // Draw success message
  if (showSuccessMessage && handOpacity <= 0) {
    drawSuccessMessage();
  }

  // Check hover on clover (only if not in success state)
  if (!showSuccessMessage) {
    checkCloverHover();
  }
}

function drawLeafShadows() {
  push();

  // Use multiply blend mode to darken the background with leaf shadows
  blendMode(MULTIPLY);

  // Left leaf - positioned off-screen to the left and top
  push();
  let leftLeafScale = max(height / 800, 1);
  let leftLeafW = 1264 * leftLeafScale;
  let leftLeafH = 966 * leftLeafScale;
  tint(255, 100); // Subtle opacity
  translate(-leftLeafW * 0.18, -leftLeafH * 0.08);
  rotate(radians(5.51));
  image(leafImg, 0, 0, leftLeafW, leftLeafH);
  pop();


  blendMode(BLEND);
  pop();
}

function drawHand() {
  if (handOpacity <= 0) return;

  push();

  // Calculate hand dimensions maintaining aspect ratio
  let handAspect = handImg.width / handImg.height;

  // Scale hand to fill height (1.43x bigger)
  let handHeight = height * 1.06 * 1.43;
  let handWidth = handHeight * handAspect;

  // Limit max dimensions on large screens
  let maxWidth = 505 * 1.43;
  if (handWidth > maxWidth) {
    handWidth = maxWidth;
    handHeight = handWidth / handAspect;
  }

  // Scale down for smaller screens
  if (width < 900) {
    handWidth = min(handWidth, width * 0.70 * 1.43);
    handHeight = handWidth / handAspect;
  }

  // Position: slightly left of center, anchored to bottom, moved down
  let handX = (width / 2) - (handWidth / 2) - 80;
  let handY = height - handHeight + (handHeight * 0.25);

  // Store bounds for hover detection (clover area is roughly top 40% of image)
  handBounds = {
    x: handX + handWidth * 0.2,
    y: handY,
    w: handWidth * 0.6,
    h: handHeight * 0.45
  };

  tint(255, handOpacity);
  image(handImg, handX, handY, handWidth, handHeight);

  pop();
}

function drawCloverRain() {
  imageMode(CENTER);

  for (let i = clovers.length - 1; i >= 0; i--) {
    let c = clovers[i];

    push();
    translate(c.x, c.y);
    rotate(c.rotation);
    // Use pre-rendered clover graphic instead of text for performance
    let scale = c.size / 40;
    image(cloverGraphic, 0, 0, 50 * scale, 50 * scale);
    pop();

    // Update position
    c.y += c.speedY;
    c.x += c.speedX;
    c.rotation += c.rotationSpeed;

    // Remove if off screen
    if (c.y > height + 100) {
      clovers.splice(i, 1);
    }
  }

  imageMode(CORNER);

  // Keep spawning clovers while raining
  if (clovers.length < 15 && random() < 0.2) {
    spawnClover();
  }
}

function drawSparkles() {
  noStroke();

  for (let i = sparkles.length - 1; i >= 0; i--) {
    let s = sparkles[i];

    push();
    translate(s.x, s.y);
    rotate(s.rotation);

    // Draw a 4-pointed star sparkle in green
    fill(117, 159, 107, s.opacity); // #759F6B - clover green

    // Main sparkle shape
    beginShape();
    let points = 4;
    let outerRadius = s.size;
    let innerRadius = s.size * 0.3;
    for (let j = 0; j < points * 2; j++) {
      let angle = (j * PI) / points - HALF_PI;
      let r = j % 2 === 0 ? outerRadius : innerRadius;
      vertex(cos(angle) * r, sin(angle) * r);
    }
    endShape(CLOSE);

    // Add a small glow effect
    fill(180, 230, 160, s.opacity * 0.3);
    ellipse(0, 0, s.size * 1.5, s.size * 1.5);

    pop();

    // Update sparkle
    s.y += s.speedY;
    s.x += s.speedX;
    s.rotation += s.rotationSpeed;
    s.opacity -= s.fadeRate;

    // Remove faded sparkles
    if (s.opacity <= 0) {
      sparkles.splice(i, 1);
    }
  }
}

function drawSuccessMessage() {
  push();

  // Semi-transparent overlay
  fill(45, 56, 64, 200);
  noStroke();

  // Success text
  fill(255);
  textAlign(CENTER, CENTER);
  textFont('Open Runde');

  // Main message
  textSize(32);
  textStyle(BOLD);
  text('CLOVER SENT TO', width / 2, height / 2 - 30);

  // Email
  textSize(24);
  textStyle(NORMAL);
  fill(200, 255, 200);
  text(sentEmail, width / 2, height / 2 + 20);

  pop();
}

function checkCloverHover() {
  if (!cardContainer) return;

  // Check if mouse is over the clover area
  let wasHovering = isHoveringClover;
  isHoveringClover = mouseX > handBounds.x &&
                     mouseX < handBounds.x + handBounds.w &&
                     mouseY > handBounds.y &&
                     mouseY < handBounds.y + handBounds.h;

  // Show card when hovering clover
  if (isHoveringClover && !wasHovering) {
    cardContainer.classList.add('visible');
    cardHasBeenHovered = false; // Reset - card needs to be hovered before it can slide out
  }

  // Only hide card when leaving clover if card has been hovered and left
  // This prevents slide out when moving from clover to card
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
