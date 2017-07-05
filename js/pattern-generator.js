function clone(cropped_canvas, offset_canvas, direction) {
  var cloned_canvas = document.createElement('canvas');
  cloned_canvas.width = cropped_canvas.width;
  cloned_canvas.height = cropped_canvas.height;
  cloned_canvas_ctx = cloned_canvas.getContext('2d');
  var cropped_start_x = direction === 'vertical' ? cropped_canvas.width / 2 - 100 : 0;
  var cropped_start_y = direction === 'vertical' ? 0 : cropped_canvas.height / 2 - 100;
  var cropped_position_x = direction === 'vertical' ? cropped_canvas.width / 2 - 30 : 0;
  var cropped_position_y = direction === 'vertical' ? 0 : cropped_canvas.height / 2 - 30;
  var cropped_width = direction === 'vertical' ? 100 : cropped_canvas.width;
  var cropped_height = direction === 'vertical' ? cropped_canvas.height : 100;
  cloned_canvas_ctx.drawImage(
    offset_canvas,
    cropped_start_x,
    cropped_start_y,
    cropped_width,
    cropped_height,
    cropped_position_x,
    cropped_position_y,
    cropped_width,
    cropped_height
  );
  cloned_canvas_ctx.globalCompositeOperation = 'destination-in';
  var gradient_end_x = direction === 'vertical' ? cropped_canvas.width / 2 + 30 : 0;
  var gradient_end_y = direction === 'vertical' ? 0 : cropped_canvas.height / 2 + 30;
  var mask_gradient = cloned_canvas_ctx.createLinearGradient(cropped_position_x, cropped_position_y, gradient_end_x, gradient_end_y);
  mask_gradient.addColorStop(0, 'transparent');
  mask_gradient.addColorStop(0.5, 'black');
  mask_gradient.addColorStop(1, 'transparent');
  cloned_canvas_ctx.fillStyle = mask_gradient;
  cloned_canvas_ctx.fillRect(cropped_position_x, cropped_position_y, cropped_width, cropped_height);
  var offset_ctx = offset_canvas.getContext('2d');
  offset_ctx.drawImage(cloned_canvas, 0, 0);
}

function resizeTo(canvas, pct) {
  var tempCanvas = document.createElement("canvas");
  var tctx = tempCanvas.getContext("2d");
  var resize_canvas = document.createElement('canvas');
  resize_canvas.width = canvas.width;
  resize_canvas.height = canvas.height;
  var cw = canvas.width;
  var ch = canvas.height;
  pct = pct * 100 / canvas.width;
  pct = pct / 100;
  tempCanvas.width = cw;
  tempCanvas.height = ch;
  tctx.drawImage(canvas, 0, 0);
  resize_canvas.width *= pct;
  resize_canvas.height *= pct;
  var resize_ctx = resize_canvas.getContext('2d');
  resize_ctx.drawImage(tempCanvas, 0, 0, cw, ch, 0, 0, cw * pct, ch * pct);
  return resize_canvas;
}

window.onload = function () {
  var file_selector = document.getElementById('pattern');
  document.querySelector('#thumb-cont + label').addEventListener('click', function () {
    document.querySelector('#pattern').value = null;
  });
  file_selector.addEventListener('change', function (e) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var modal_backdrop = document.createElement('div');
      modal_backdrop.id = "backdrop-overlay";
      var modal_container = document.createElement('div');
      modal_container.id = 'modal-container';
      var modal = document.createElement('div');
      modal.id = 'modal';
      var img_container = document.createElement('div');
      img_container.className = 'img-container';
      var img = document.createElement('img');
      img.src = e.target.result;
      img_container.appendChild(img);
      modal.appendChild(img_container);
      var modal_buttons_cont = document.createElement('div');
      modal_buttons_cont.id = 'buttons-cont';
      var resize_input = document.createElement('input');
      resize_input.id = 'resizer';
      resize_input.type = 'checkbox';
      var resize_label = document.createElement('label');
      resize_label.htmlFor = 'resizer';
      resize_label.innerText = 'Resize Pattern (px)';
      resize_label.className = 'button';
      var resize_textbox = document.createElement('input');
      resize_textbox.id = 'resizer-text';
      resize_textbox.type = 'number';
      resize_textbox.setAttribute('max', '600');
      resize_textbox.setAttribute('min', '50');
      var resize_container = document.createElement('div');
      resize_container.id = 'resizer-container';
      resize_container.appendChild(resize_input);
      resize_container.appendChild(resize_label);
      resize_container.appendChild(resize_textbox);
      var cancel_btn = document.createElement('button');
      cancel_btn.id = 'cancel-btn';
      cancel_btn.innerText = 'Cancel';
      var crop_btn = document.createElement('button');
      crop_btn.id = 'crop-btn';
      crop_btn.innerText = 'Crop';
      cancel_btn.className = crop_btn.className = 'button';
      modal_buttons_cont.appendChild(crop_btn);
      modal_buttons_cont.appendChild(cancel_btn);
      var modal_options = document.createElement('div');
      modal_options.id = 'modal-options';
      modal_options.appendChild(resize_container);
      modal_options.appendChild(modal_buttons_cont);
      modal.appendChild(modal_options);
      modal_container.appendChild(modal);
      document.body.appendChild(modal_backdrop);
      document.body.appendChild(modal_container);
      var cropper = new Cropper(img, {
        aspectRatio: 16 / 16,
        viewMode: 3,
        rotatable: false
      });
      resize_label.addEventListener('click', function () {
        document.querySelector('#resizer-text').focus();
      });
      crop_btn.addEventListener('click', function (e) {
        var cropped_canvas = cropper.getCroppedCanvas();
        var offset_canvas = document.createElement('canvas');
        offset_canvas.width = cropped_canvas.width;
        offset_canvas.height = cropped_canvas.height;
        offset_canvas_ctx = offset_canvas.getContext('2d');
        offset_canvas_ctx.drawImage(cropped_canvas, -cropped_canvas.width / 2, 0);
        offset_canvas_ctx.drawImage(cropped_canvas, cropped_canvas.width / 2, 0);
        offset_canvas_ctx.drawImage(offset_canvas, 0, -offset_canvas.height / 2)
        offset_canvas_ctx.drawImage(offset_canvas, 0, offset_canvas.height / 2);
        clone(cropped_canvas, offset_canvas, 'vertical');
        clone(cropped_canvas, offset_canvas, 'horizontal');
        clone(cropped_canvas, offset_canvas, 'vertical');
        clone(cropped_canvas, offset_canvas, 'horizontal');
        document.getElementById('modal-container').style.display = 'none';
        if (resize_input.checked) {
          offset_canvas = resizeTo(offset_canvas, resize_textbox.value);
        }
        document.getElementById('thumbnail').src = offset_canvas.toDataURL();
        document.getElementById('background-preview').style.backgroundImage = 'url(' + offset_canvas.toDataURL() + ')';
        document.body.removeChild(document.getElementById('backdrop-overlay'));
        document.body.removeChild(document.getElementById('modal-container'));
      });
      cancel_btn.addEventListener('click', function () {
        document.body.removeChild(document.getElementById('backdrop-overlay'));
        document.body.removeChild(document.getElementById('modal-container'));
      });
    }
    reader.readAsDataURL(e.target.files[0]);
  }, false);
}
