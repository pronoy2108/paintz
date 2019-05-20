'use strict';

function SettingsManager() {
	/** @private {Object} The current settings */
	this._settings = {};
	
	// Load settings from local storage where possible.
	this._loadStoredSettings();
}

// Define constants.
/** @constant {Object} The default values for all settings */
SettingsManager.prototype.DEFAULTS = {
	// Canvas:
	width: 640,
	height: 480,
	// Toolbar-set options:
	tool: 'doodle',
	lineWidth: 2,
	outlineOption: 'outlineFill',
	lineColor: '#000000',
	fillColor: '#ffffff',
	fontFamily: 'sans-serif',
	fontSize: 16,
	bold: false,
	italic: false,
	// Settings:
	theme: 'default',
	colorPalette: 'material',
	ghostDraw: false,
	antiAlias: true,
	maxUndoStackDepth: 50,
	// Other:
	firstRunDone: false
};
/** @constant {String} The prefix to add to stored setting keys in local storage */
SettingsManager.prototype.LOCAL_STORAGE_PREFIX = 'paintz_';
/** @constant {Object<String,String>} The primary color associated with each interface theme */
SettingsManager.prototype.THEME_COLORS = {
	default: '#3f51b5',
	dark: '#212121',
	light: '#f5f5f5'
};

/**
 * Set settings based on local storage, falling back to defaults where necessary.
 */
SettingsManager.prototype._loadStoredSettings = function () {
	for (var setting in this.DEFAULTS) {
		// Attempt to load settings from local storage.
		// Some browsers will throw an error if this is attempted in a private browsing session.
		try {
			var storedValue = localStorage.getItem(this.LOCAL_STORAGE_PREFIX + setting);
			if (storedValue !== null) {
				// Parse stored values to their intended types.
				var correctedValue = this._toExpectedType(setting, storedValue);
				this.set(setting, correctedValue);
				continue;
			}
		} catch (err) {}
		
		this.set(setting, this.DEFAULTS[setting]);
	}
};

/**
 * Convert a setting value to its expected type.
 * @param {String} setting - The name of the setting
 * @param {Object} value - The new value for the setting
 * @returns {Object} The value as the expected type for the setting
 */
SettingsManager.prototype._toExpectedType = function (setting, value) {
	switch (typeof(this.DEFAULTS[setting])) {
		case 'boolean':
			return !!value;
		case 'number':
			return parseFloat(value);
		default:
			return value;
	}
};

/**
 * Update the UI to reflect a setting change.
 * @param {String} setting - The name of the setting
 * @param {Object} value - The new value to save for the setting
 */
SettingsManager.prototype._implementSettingChange = function (setting, value) {
	switch (setting) {
		case 'width':
			if (canvas.width !== value) {
				canvas.width = value;
			}
			if (preCanvas.width !== value) {
				preCanvas.width = value;
			}
			document.getElementById('resolution').innerHTML =
				value + ' &times; ' + this.get('height') + 'px';
			break;
		case 'height':
			if (canvas.height !== value) {
				canvas.height = value;
			}
			if (preCanvas.height !== value) {
				preCanvas.height = value;
			}
			document.getElementById('resolution').innerHTML =
				this.get('width') + ' &times; ' + value + 'px';
			break;
		case 'lineWidth':
			// Some tools' cursors change with the line width, so reactivate the tool.
			if (tools && tools.currentTool) {
				tools.currentTool.activate();
			}
			break;
		case 'theme':
			document.getElementById('themeStyleLink').href = 'styles/themes/' + value + '.css';
			document.querySelector('meta[name="msapplication-navbutton-color"]').content =
				document.querySelector('meta[name="theme-color"]').content = this.THEME_COLORS[value];
			break;
		case 'ghostDraw':
			preCanvas.classList[value ? 'add' : 'remove']('ghost');
			break;
	}
};

/**
 * Get a setting.
 * @param {String} setting - The name of the setting
 */
SettingsManager.prototype.get = function (setting) {
	var value = this._settings[setting];
	if (typeof(value) !== 'undefined') {
		return this._toExpectedType(setting, value);
	}
	return this.DEFAULTS[setting];
};

/**
 * Save a setting.
 * @param {String} setting - The name of the setting
 * @param {Object} value - The new value to save for the setting
 */
SettingsManager.prototype.set = function (setting, value) {
	var correctedValue = this._toExpectedType(setting, value);
	this._settings[setting] = correctedValue;
	this._implementSettingChange(setting, correctedValue);
	
	// Attempt to save the setting to local storage.
	// Some browsers will throw an error if this is attempted in a private browsing session.
	try {
		if (typeof(this.DEFAULTS[setting]) === 'boolean') {
			// Convert boolean values to truey/falsey string values for local storage.
			// Other values should coerce to strings fine.
			correctedValue = correctedValue ? 'true' : '';
		}
		localStorage.setItem(this.LOCAL_STORAGE_PREFIX + setting, correctedValue);
	} catch (err) {}
};
