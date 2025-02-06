
# TabBarController.gd

# This script handles tabs and panels

extends Control

## Panels
@onready var shop_tab: PanelContainer = %ShopTab
@onready var goals_tab: PanelContainer = %GoalsTab
@onready var home_tab: PanelContainer = %HomeTab
@onready var social_tab: PanelContainer = %SocialTab
@onready var profile_tab: PanelContainer = %ProfileTab
@onready var settings_tab: PanelContainer = %SettingsTab

## Buttons
@onready var shop_button: TextureButton = %ShopButton
@onready var goals_button: TextureButton = %GoalsButton
@onready var home_button: TextureButton = %HomeButton
@onready var social_button: TextureButton = %SocialButton
@onready var profile_button: TextureButton = %ProfileButton
@onready var settings_button: TextureButton = %SettingsButton
var current_button : String = ""
# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	current_button = "HomeButtonTouch"
	set_connections()
	on_tab_pressed(home_button)

# Setup each button connection for each button in the group "TouchScreenButtons"
func set_connections():
	var touch_areas = get_tree().get_nodes_in_group("TouchScreenButtons")
	for area in touch_areas:
		area.connect("pressed", Callable(self, "on_touch_area_pressed").bind(area))

# When a button is pressed match the button to its panel
func on_touch_area_pressed(touch_area):
	# Prevent full functionallity when called to the same page
	if current_button == str(touch_area.name):
		return
	
	# Set the current_button
	print("touch_area: " + str(touch_area.name))
	current_button = str(touch_area.name)
	
	match touch_area.name:
		"ShopButtonTouch": on_tab_pressed(shop_button)
		"GoalsButtonTouch": on_tab_pressed(goals_button)
		"HomeButtonTouch": on_tab_pressed(home_button)
		"SocialButtonTouch": on_tab_pressed(social_button)
		"ProfileButtonTouch": on_tab_pressed(profile_button)
		"SettingsButton": on_tab_pressed(settings_button)

# When a panel is selected make it visible to the user and disable the others
func on_tab_pressed(button):
	# Makes all buttons translucent
	for b in button.get_button_group().get_buttons():
		b.modulate.a = 0.25
	
	# Make the selected button opaque
	button.modulate.a = 1.0
	
	shop_tab.visible = false
	goals_tab.visible = false
	home_tab.visible = false
	social_tab.visible = false
	profile_tab.visible = false
	settings_tab.visible = false
	
	match button.name:
		"ShopButton": shop_tab.visible = true
		"GoalsButton": goals_tab.visible = true
		"HomeButton": home_tab.visible = true
		"SocialButton": social_tab.visible = true
		"ProfileButton": profile_tab.visible = true
		"SettingsButton": settings_tab.visible = true
