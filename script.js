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
var problem;

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
function DigitDisplay(x, y, base, length, parent_container) {
  
  var base = base;

  var boxes = [];
  var box_texts = [];
  var digits = []; 
  
  for (var i = 0; i < length; i++) {
    var box = new createjs.Shape();
    box.x = x - (button_size * (i + 1));
    box.y = y;
    
    var pad = button_size / 40.0;
    box.graphics.beginFill("#eeeeee").drawRect(
        pad, pad, button_size - pad * 2, button_size - pad * 2);
    
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
    msg.y = box.y - bd.height/2;
    msg.text ="x";

    parent_container.addChild(msg);
    box_texts.push(msg);
  
  }
  
  // base subscript
  var show_base = false;
  if (show_base) {
    var msg = new createjs.Text("", "1px Courier", "#111");
    msg.scaleX = button_size / 64;
    msg.scaleY = button_size / 64;
    msg.text = base.toString(10);
    //msg.textAlign = 'center';
    var bd = msg.getBounds();
    msg.x = x;
    msg.y = box.y + button_size - bd.height * msg.scaleY;

    parent_container.addChild(msg);
  }

  this.num_digits = 0;
  this.num = 0;

  this.setDigits = function(num) {
    this.num = num; 
    var new_digits = num2digits(num, base);
    
    for (var i = 0; i < digits.length; i++) {
      if (i < new_digits.length) {
        digits[i] = new_digits[i];
        box_texts[i].text = digits[i].toString(16);
      } else {
        digits[i] = 0;
        box_texts[i].text = "";
      }
    }
    
    this.num_digits = new_digits.length;
    //console.log(" new digits " + num + " " + new_digits.length + " " 
    //    + digits.reverse());
    stage.update(); 
  }

  this.setDigits(this.num);

  return this;
}

// Fixed to addition currently
function Problem(x, y, num1, num2, base, parent_container) {
  
  var num1 = Math.floor(num1);
  var num2 = Math.floor(num2);
  this.answer = num1 + num2;

  digit_display1.setDigits(num1);
  digit_display2.setDigits(num2);
  
  var num_digits = Math.max(digit_display1.num_digits, digit_display2.num_digits);
  var underline = new createjs.Shape();
  underline.x = x - (num_digits + 1) * button_size;
  underline.y = y + button_size;
  underline.graphics.beginFill("#111111").drawRect(0, 0, button_size * (num_digits + 1), 10);
  parent_container.addChild(underline);

  {
    var msg = new createjs.Text("+", "1px Courier", "#111");
    msg.scaleX = button_size / 16;
    msg.scaleY = button_size / 16;
    msg.textAlign = 'center';
    var bd = msg.getBounds();
    msg.x = x - (num_digits + 0.5) * button_size;
    msg.y = y;

    parent_container.addChild(msg);
  }



  return this;
}

// TODO refactor to use DigitDisplay
function NumEntryBox(x, y, base, parent_container, num_digits) {
 
  var base = base;
  var x = x;
  var y = y;
  var digits = [];
  var boxes = [];
  var box_texts = [];
  var num_digits = num_digits;

  for (var i = 0; i < num_digits; i++) {

    var box = new createjs.Shape();
    box.x = x - button_size * (i + 1);
    box.y = y;
    
    var pad = button_size / 40.0;
    box.graphics.beginFill("#eeeeee").drawRect(
        pad, pad, button_size - pad * 2, button_size - pad * 2);
    
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
    msg.y = box.y - bd.height/2;
    msg.text ="";

    parent_container.addChild(msg);
    box_texts.push(msg);
  }
  
  var cur_ind = num_digits - 1;
  var cur_underline = new createjs.Shape();
  cur_underline.x = x - (cur_ind + 1) * button_size;
  cur_underline.y = y + button_size;
  cur_underline.graphics.beginFill("#919591").drawRect(pad, 0, button_size - pad * 2, 10);
  parent_container.addChild(cur_underline);

  this.numClick = function(evt, data) {

    digits[cur_ind] = data.num;
    box_texts[cur_ind].text = digits[cur_ind].toString(16);
    console.log("clicked on " + digits[cur_ind]);
    cur_ind -= 1;
    cur_ind = (cur_ind + num_digits) % num_digits;
    cur_underline.x = x - (cur_ind + 1) * button_size;
   
    var answer = 0;
    var factor = 1;
    for (var i = 0; i < digits.length; i++) {
      answer += digits[i] * factor;
      factor *= base;
    }
    console.log("answer " + answer + " " + problem.answer);
    
    if (answer === problem.answer) {
      indicator.graphics.clear();
      indicator.graphics.beginFill("#11ee11").drawRect(
          x + pad, y + pad, button_size - pad * 2, button_size - pad * 2);
      indicator_msg.text = "\u2714";
    } else {
      indicator.graphics.clear();
      indicator.graphics.beginFill("#ff5555").drawRect(
          x + pad, y + pad, button_size - pad * 2, button_size - pad * 2);
      indicator_msg.text = "";
    }
    stage.update();
  }

  // show whether user got problem right or now
  {
  var indicator = new createjs.Shape();
  var pad = button_size / 6.0;
  indicator.graphics.beginFill("#ff5555").drawRect(
      x + pad, y + pad, button_size - pad * 2, button_size - pad * 2);
  parent_container.addChild(indicator);
  var indicator_msg = new createjs.Text("", "1px Courier", "#111");
  indicator_msg.scaleX = button_size / 20.0;
  indicator_msg.scaleY = button_size / 20.0;
  indicator_msg.x = x + button_size/2;
  indicator_msg.y = y + pad/2;
  indicator_msg.textAlign = 'center';
  parent_container.addChild(indicator_msg);
  }
  return this;
}


function NumButton(x, y, num, parent_container, num_entry_box) {
  var num = num;
  
  var button = new createjs.Shape();
  button.x = x;
  button.y = y;
  var pad = button_size / 40.0;
  button.graphics.beginFill("#eeeeee").drawRect(
      pad, pad, button_size - pad * 2, button_size - pad * 2);
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
  var x = 0.65 * wd;
  num_entry_box = NumEntryBox(x, button_size * 3, base, stage, 2);
  numpad = NumPad(base, stage, num_entry_box);
  
  digit_display1 = new DigitDisplay(x, button_size * 1, base, 5, stage)
  digit_display2 = new DigitDisplay(x, button_size * 2, base, 5, stage)
  problem = Problem(x, button_size * 2, Math.random() * 100, 1, base, stage);


  stage.update();
}
