/*
 Copyright Lucas Walter February 2014
 
 This file is part of mathtest.

 Foobar is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Foobar is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 
 */

var stage;
var numpad;
var num_entry_box;
var wd;
var ht;
var button_size;
var digit_display1;
var digit_display2;

// digits are in reverse order, least sig in first index
function num2digits(num, base) {
  
  num = Math.floor(num);

  var digits = [];
  
  do {
    var new_digit = num % base;
    digits.push(new_digit);
    num = Math.floor(num / base); 
  } while (num != 0);

  return digits;
}

// draw an array of digits from right to left
function DigitDisplay(x, y, length, parent_container) {
  
  var boxes = [];
  var box_texts = [];
  var digits = []; 
  for (var i = 0; i < length; i++) {
    var box = new createjs.Shape();
    box.x = x - (button_size * i + 1);
    box.y = y;
    
    var pad = button_size / 20.0;
    box.graphics.beginFill("#eeeeee").drawRect(pad, pad, button_size - pad, button_size - pad);
    
    parent_container.addChild(box);
    boxes.push(box);
     
    var digit = 0;
    digits.push(digit);
    
    var msg = new createjs.Text("", "1px Courier", "#111");
    msg.scaleX = button_size / 16;
    msg.scaleY = button_size / 16;
    msg.text = digit.toString(16);
    msg.textAlign = 'center';
    var bd = msg.getBounds();
    msg.x = box.x + pad + button_size/2;
    msg.y = box.y;
    msg.text ="";

    parent_container.addChild(msg);
    box_texts.push(msg);
  
  }

  this.setDigits = function(new_digits) {
    
    for (var i = 0; i < digits.length; i++) {
      if (i < new_digits.length) {
        digits[i] = new_digits[i];
        box_texts[i] = digits[i].toString(16);
      } else {
        digits[i] = 0;
        box_texts[i] = "";
      }
    }
  
  }

  return this;
}

function Problem(x, y, num1, num2, base, parent_container) {
  
  var num1 = num1;
  var num2 = num2;
  
  var digits1 = num2digits(num1, base);
  var digits2 = num2digits(num2, base);

  console.log("num1 " + num1 + " " + digits1.reverse())

  return this;
}

function NumEntryBox(x, y, parent_container, num_digits) {
 
  var x = x;
  var y = y;
  var digits = [];
  var boxes = [];
  var box_texts = [];
  var num_digits = num_digits;

  for (var i = 0; i < num_digits; i++) {

    var box = new createjs.Shape();
    box.x = x + button_size * i;
    box.y = y;
    
    var pad = button_size / 20.0;
    box.graphics.beginFill("#eeeeee").drawRect(pad, pad, button_size - pad, button_size - pad);
    
    parent_container.addChild(box);
    boxes.push(box);
    
    var digit = 0;
    digits.push(digit);
    
    var msg = new createjs.Text("", "1px Courier", "#111");
    msg.scaleX = button_size / 16;
    msg.scaleY = button_size / 16;
    msg.text = digit.toString(16);
    msg.textAlign = 'center';
    var bd = msg.getBounds();
    msg.x = x + button_size * i + pad + button_size/2;
    msg.y = y - bd.height/2;
    msg.text ="";

    parent_container.addChild(msg);
    box_texts.push(msg);
  }
  
  var cur_ind = 0;
  var cur_underline = new createjs.Shape();
  cur_underline.x = x + cur_ind * button_size;
  cur_underline.y = y + button_size;
  cur_underline.graphics.beginFill("#111111").drawRect(pad, 0, button_size - pad, 10);
  parent_container.addChild(cur_underline);

  this.numClick = function(evt, data) {

    digits[cur_ind] = data.num;
    box_texts[cur_ind].text = digits[cur_ind].toString(16);
    console.log("clicked on " + digits[cur_ind]);
    cur_ind += 1;
    cur_ind %= num_digits;
    cur_underline.x = x + cur_ind * button_size;
    
    stage.update();
  }

  return this;
}


function NumButton(x, y, num, parent_container, num_entry_box) {
  var num = num;
  
  var button = new createjs.Shape();
  button.x = x;
  button.y = y;
  var pad = button_size / 20.0;
  button.graphics.beginFill("#eeeeee").drawRect(pad, pad, button_size - pad, button_size - pad);
  parent_container.addChild(button);
  //var listener = 
  button.on("click", num_entry_box.numClick, null, false, {num:num});

  var msg = new createjs.Text("", "1px Courier", "#111");
  msg.scaleX = button_size / 16;
  msg.scaleY = button_size / 16;
  msg.text = num.toString(16);
  msg.textAlign = 'center';
  var bd = msg.getBounds();
  msg.x = x + pad + button_size/2;
  msg.y = y - bd.height/2;
  parent_container.addChild(msg);

  return this;
}

function NumPad(base, parent_container, num_entry_box) {
  var number_buttons = [];

  var base = base;

  container = new createjs.Container();
  parent_container.addChild(container);
  
  var buttons_per_column = Math.floor(ht / button_size);
  var x_start = wd - button_size * Math.ceil(base / buttons_per_column);

  for (var i = 0; i < base; i++) {
    var x = x_start + button_size * Math.floor(i / buttons_per_column);
    var y = (i % buttons_per_column) * button_size; 
    var num_button = NumButton(x, y, i, container, num_entry_box);

  }
}

var base = 10;
function init() {
  stage = new createjs.Stage("mathtest");

  wd = stage.canvas.width;
  ht = stage.canvas.height;

  var context = stage.canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;

  button_size = ht/5;
  var x = 0.5 * wd;
  num_entry_box = NumEntryBox(x, button_size * 3, stage, 2);
  numpad = NumPad(base, stage, num_entry_box);
  
  digit_display1 = new DigitDisplay(x, button_size * 1, 5, stage)
  digit_display2 = new DigitDisplay(x, button_size * 2, 5, stage)
  //var problem = Problem(0, 0, Math.random() * 100, 1, base, stage);

  stage.update();
}
