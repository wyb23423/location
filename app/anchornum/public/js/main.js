(function(factory) {
	if(typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if(typeof exports === 'object') {
		factory(require('jquery'));
	} else {
		factory(jQuery);
	}
})(function($) {
	'use strict';
	var console = window.console || {
		log: function() {}
	};

	function CropAvatar($element) {
		this.$container = $element;
		this.$avatarView = this.$container.find('.avatar-view');
		this.$avatar = this.$avatarView.find('img');
		this.$avatarModal = this.$container.find('#avatar-modal');
		this.$loading = this.$container.find('.loading');
		this.$avatarForm = this.$avatarModal.find('.avatar-form');
		this.$avatarUpload = this.$avatarModal.find('.avatar-upload');
		this.$avatarSrc = this.$avatarModal.find('.avatar-src');
		this.$avatarData = this.$avatarModal.find('.avatar-data');
		this.$avatarInput = this.$avatarModal.find('.avatar-input');
		this.$avatarSave = this.$avatarModal.find('.avatar-save');
		this.$avatarBtns = this.$avatarModal.find('.avatar-btns');
		this.$avatarWrapper = this.$avatarModal.find('.avatar-wrapper');
		this.$avatarPreview = this.$avatarModal.find('.avatar-preview');
		this.init();
		console.log(this.$avatarInput);
	}
	CropAvatar.prototype = {
		constructor: CropAvatar,
		support: {
			fileList: !!$('<input type="file">').prop('files'),
			blobURLs: !!window.URL && URL.createObjectURL,
			formData: !!window.FormData
		},
		init: function() {
			this.support.datauri = this.support.fileList && this.support.blobURLs;
			if(!this.support.formData) {
				this.initIframe();
			}
			this.initTooltip();
			this.initModal();
			this.addListener();
		},
		addListener: function() {
			console.log(this.$avatarSave)
			this.$avatarView.on('click', $.proxy(this.click, this));
			this.$avatarInput.on('change', $.proxy(this.change, this));
			this.$avatarSave.on('click', $.proxy(this.submit, this));
			this.$avatarBtns.on('click', $.proxy(this.rotate, this));
		},
		initTooltip: function() {
			this.$avatarView.tooltip({
				placement: 'bottom'
			});
		},
		initModal: function() {
			this.$avatarModal.modal({
				show: false
			});
		},
		initPreview: function() {
			var url = this.$avatar.attr('src');
			this.$avatarPreview.empty().html('<img src="' + url + '">');
		},
		initIframe: function() {
			var target = 'upload-iframe-' + (new Date()).getTime(),
				$iframe = $('<iframe>').attr({
					name: target,
					src: ''
				}),
				_this = this;
			$iframe.one('load', function() {
				$iframe.on('load', function() {
					var data;
					try {
						data = $(this).contents().find('body').text();
					} catch(e) {
						console.log(e.message);
					}
					if(data) {
						try {
							data = $.parseJSON(data);
						} catch(e) {
							console.log(e.message);
						}
						_this.submitDone(data);
					} else {
						_this.submitFail('Image upload failed!');
					}
					_this.submitEnd();
				});
			});
			this.$iframe = $iframe;
			this.$avatarForm.attr('target', target).after($iframe.hide());
		},
		click: function() {
			this.$avatarModal.modal('show');
			this.initPreview();
		},
		change: function() {
			var files, file;
			if(this.support.datauri) {
				files = this.$avatarInput.prop('files');
				
				if(files.length > 0) {
					file = files[0];
					
					if(this.isImageFile(file)) {
						if(this.url) {
							URL.revokeObjectURL(this.url);
						}
						this.url = URL.createObjectURL(file);
						this.startCropper();
					}
				}
			} else {
				file = this.$avatarInput.val();
				if(this.isImageFile(file)) {
					this.syncUpload();
				}
			}
		},
		submit: function() {
			if(!this.$avatarSrc.val() && !this.$avatarInput.val()) {
				return false;
			}
			if(this.support.formData) {
				this.ajaxUpload();
				return false;
			}
		},
		rotate: function(e) {
			var data;
			if(this.active) {
				data = $(e.target).data();
				if(data.method) {
					this.$img.cropper(data.method, data.option);
				}
			}
		},
		isImageFile: function(file) {
			if(file.type) {
				return /^image\/\w+$/.test(file.type);
			} else {
				return /\.(jpg|jpeg|png|gif)$/.test(file);
			}
		},
		startCropper: function() {
			var _this = this;
			if(this.active) {
				this.$img.cropper('replace', this.url);
			} else {
				this.$img = $('<img id="imgIs" src="' + this.url + '">');
				this.$avatarWrapper.empty().html(this.$img);
				this.$img.cropper({
					aspectRatio: 1,
					preview: this.$avatarPreview.selector,
					strict: false,
					crop: function(data) {
						var json = ['{"x":' + data.x, '"y":' + data.y, '"height":' + data.height, '"width":' + data.width, '"rotate":' + data.rotate + '}'].join();
						_this.$avatarData.val(json);
					}
				});
				this.active = true;
			}
		},
		stopCropper: function() {
			if(this.active) {
				this.$img.cropper('destroy');
				this.$img.remove();
				this.active = false;
			}
		},
		ajaxUpload: function() {
			var url = "/api/tag/upload/avatar",
				data =this.$avatarPreview.find("img"),
				_this = this;
				var $image=$("#imgIs")
				console.log($image)
				var dataURL = $image.cropper("getCroppedCanvas");
				var imgurl=dataURL.toDataURL("image/png",1.0);//这里转成base64 image，img的src可直接使用
				$("#image").attr("src", imgurl);
				var datalist={avatar:imgurl}
			$.ajax(url, {
				type: 'post',
				data: datalist,
				success: function(data) {
					var avatarUrl=data.resultMap.avatarUrl;
					$(".avatarUrl").val(avatarUrl);
					$("#avatar-modal").modal('toggle')
				}
			});
		},
		syncUpload: function() {
			this.$avatarSave.click();
		},
		submitStart: function() {
			this.$loading.fadeIn();
		},
		submitDone: function(data) {
			console.log(data);
			if($.isPlainObject(data) && data.state === 200) {
				if(data.result) {
					this.url = data.result;
					if(this.support.datauri || this.uploaded) {
						this.uploaded = false;
						this.cropDone();
					} else {
						this.uploaded = true;
						this.$avatarSrc.val(this.url);
						this.startCropper();
					}
					this.$avatarInput.val('');
				} else if(data.message) {
					this.alert(data.message);
				}
			} else {
				this.alert('Failed to response');
			}
		},
		submitFail: function(msg) {
			this.alert(msg);
		},
		submitEnd: function() {
			this.$loading.fadeOut();
		},
		cropDone: function() {
			this.$avatarForm.get(0).reset();
			this.$avatar.attr('src', this.url);
			this.stopCropper();
			this.$avatarModal.modal('hide');
		},
		alert: function(msg) {
			var $alert = ['<div class="alert alert-danger avater-alert">', '<button type="button" class="close" data-dismiss="alert">&times;</button>', msg, '</div>'].join('');
			this.$avatarUpload.after($alert);
		}
	};
	$(function() {
		return new CropAvatar($('#crop-avatar'));
	});
});