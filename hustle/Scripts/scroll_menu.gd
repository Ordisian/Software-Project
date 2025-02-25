extends ScrollContainer

@export var panel_scale = 1.0 # (float, 0.5, 1, 0.1)
@export var panel_current_scale = 1.3 # (float, 1, 1.5, 0.1)
@export var scroll_duration = 1.3 # (float, 0.1, 1, 0.1)

var current_panel_index: int = 0
var panel_x_positions: Array = []

@onready var scroll_tween: Tween
@onready var margin_right: int = $CenterContainer/MarginContainer.get("theme_override_constants/margin_right")
@onready var panel_spacing: int = $CenterContainer/MarginContainer/HBoxContainer.get("theme_override_constants/separation")
@onready var panel_nodes: Array = $CenterContainer/MarginContainer/HBoxContainer.get_children()

func _ready() -> void:
	# Hide the horizontal scroll bar
	get_h_scroll_bar().modulate.a = 0
	
	# Defer setting initial positions to ensure nodes are fully initialized
	call_deferred("_set_initial_positions")

func _set_initial_positions() -> void:
	for panel in panel_nodes:
		# Calculate the x-position for each panel
		var panel_pos_x: float = (margin_right + panel.position.x) - ((size.x - panel.size.x) / 2)
		
		# Set the pivot point to the center of the panel
		panel.pivot_offset = (panel.size / 2)
		
		# Store the x-position for later use
		panel_x_positions.append(panel_pos_x)
	
	# Set the initial scroll position to the first panel
	scroll_horizontal = panel_x_positions[current_panel_index]
	
	# Start the scroll animation
	scroll()

func _process(delta: float) -> void:
	for index in range(panel_x_positions.size()):
		var panel_pos_x: float = panel_x_positions[index]
		var swipe_length: float = (panel_nodes[index].size.x / 2) + (panel_spacing / 2)
		var swipe_current_length: float = abs(panel_pos_x - scroll_horizontal)
		
		# Calculate the scale and opacity based on the swipe length
		var panel_scale_value: float = remap(swipe_current_length, swipe_length, 0, panel_scale, panel_current_scale)
		var panel_opacity: float = remap(swipe_current_length, swipe_length, 0, 0.3, 1)
		
		# Clamp the scale and opacity to their respective ranges
		panel_scale_value = clamp(panel_scale_value, panel_scale, panel_current_scale)
		panel_opacity = clamp(panel_opacity, 0.3, 1)
		
		# Apply the scale and opacity to the PanelContainer
		panel_nodes[index].scale = Vector2(panel_scale_value, panel_scale_value)
		panel_nodes[index].modulate.a = panel_opacity
		
		# Update the current panel index if this panel is the closest to the center
		if swipe_current_length < swipe_length:
			current_panel_index = index

func scroll() -> void:
	# Create a new tween for smooth scrolling
	scroll_tween = create_tween().set_parallel(true)
	
	# Tween the scroll position to the current panel's x-position
	scroll_tween.tween_property(
		self,
		"scroll_horizontal",
		panel_x_positions[current_panel_index],
		scroll_duration
	).from_current().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	
	# Tween the scale of each panel
	for index in range(panel_nodes.size()):
		var target_scale: float = panel_current_scale if index == current_panel_index else panel_scale
		scroll_tween.tween_property(
			panel_nodes[index],
			"scale",
			Vector2(target_scale, target_scale),
			scroll_duration
		).from_current().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)

func _on_ScrollContainer_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.pressed:
			# Stop the tween if the user starts interacting
			scroll_tween.stop()
		else:
			# Restart the scroll animation when the user releases the mouse button
			scroll()
