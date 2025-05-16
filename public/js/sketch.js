//https://www.youtube.com/watch?v=ttz05d8DSOs

var zoom = 500;
var s = 10;
var k = 0;

var birdsNumber = 15; // how many?
var birds = []; // bird objects
/* var mask = null; // white mask to create frame
var bg = null; // sunset background. */


function setup() {
  console.log(document.getElementById('bird-canvas'));
  console.log('sketch wurde aufgerufen!!!');
  const canvas = createCanvas(windowWidth, windowHeight);
  background(255);
  canvas.parent('bird-canvas');
  document.body.appendChild(canvas.canvas);
  /* createCanvas(windowWidth, windowHeight); */



  // bg = new bg_c();
  for (let i = 0; i < birdsNumber; i++) {
    birds.push(new bird_c());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);

  //bg.draw();

  for (let i = 0; i < birds.length; i++) {
    birds[i].draw();
  }
}

// Flapping bird class.
function bird_c() {
  // Variables for each bird.
  this.pos = createVector(
    random(width * 0.2, width * 0.8),
    random(height * 0.2, height * 0.8)
  );
  /* this.angle = random(TWO_PI, TWO_PI * 1);
  this.vel = random(2, 5); */
  this.angle = Math.max(0, Math.min(random(TWO_PI, TWO_PI * 1), TWO_PI)); // Angle auf gültigen Bereich beschränken
  this.vel = Math.max(0, Math.min(random(2, 5), 5));  // Geschwindigkeit auf gültigen Bereich beschränken

  this.flap = random(0, TWO_PI);

  this.draw = function () {
    console.log('Winkel:', this.angle, 'Geschwindigkeit:', this.vel);
    if (!isFinite(this.angle) || !isFinite(this.vel)) {
      console.error('Ungültiger Winkel oder Geschwindigkeit:', this.angle, this.vel);
      return;
    }

    this.pos.add(p5.Vector.fromAngle(this.angle).mult(this.vel));

    // Überprüfe die Werte vor der Verwendung
    if (!isFinite(this.pos.x) || !isFinite(this.pos.y)) {
      console.error('Ungültige Position:', this.pos);
      return;
    }

    // check if off screen.
    if (this.pos.x > width * 0.9) {
      /* if (this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0) { */
      // Set new properties for the bird.
      this.pos = createVector(
        /* random(0, width * 0.2),
        random(height * 0.33, height * 0.66) */
        random(width * 0.2, width * 0.8),
        random(height * 0.2, height * 0.8)
      );
      /* this.vel = random(0.8, 1.5); */
      this.vel = random(1.5, 3)
      this.flap = random(0, TWO_PI);
      this.angle = random(TWO_PI * 0.97, TWO_PI * 1.03);
    }

    // increment flapping
    this.flap += this.vel * 0.05;

    // Construct three points for a triangle from the pos variable.
    let p0 = p5.Vector.fromAngle(this.angle).setMag(-10 * 0.5).add(this.pos.copy());  // kleinerer Wert
    let p1 = p5.Vector.fromAngle(this.angle).setMag(10 * 1).add(this.pos.copy());   // kleinerer Wert
    let p2 = p5.Vector.fromAngle(this.angle).rotate(HALF_PI).setMag(15 * sin(this.flap)).add(this.pos.copy()); // kleinerer Wert

    // Überprüfen der Positionen, bevor sie in rect() verwendet werden
    if (!isFinite(p0.x) || !isFinite(p0.y)) {
      console.error('Ungültige Position p0:', p0);
      return;
    }
    if (!isFinite(p1.x) || !isFinite(p1.y)) {
      console.error('Ungültige Position p1:', p1);
      return;
    }
    if (!isFinite(p2.x) || !isFinite(p2.y)) {
      console.error('Ungültige Position p2:', p2);
      return;
    }

    // fill of bird is dependent on flap cycle
    noStroke();
    fill(0);

    // Pixel bird body
    rect(this.pos.x, this.pos.y, 10, 10); // small pixel-style body

    // Pixel-style wings (approximate triangle with rectangles)
    rect(p0.x, p0.y, 4, 4);
    rect(p1.x, p1.y, 4, 4);
    rect(p2.x, p2.y, 4, 4);

    // Verbindungspixel
    drawConnectionRect(p0, p1);
    drawConnectionRect(p1, p2);
    drawConnectionRect(p2, p0);
  };

  function drawConnectionRect(pA, pB, step = 8) {
    let d = p5.Vector.dist(pA, pB);
    let dir = p5.Vector.sub(pB, pA).normalize();
    for (let i = 0; i < d; i += step) {
      let pos = p5.Vector.add(pA, p5.Vector.mult(dir, i));
      rect(pos.x, pos.y, 6, 6);
    }
  }
}
