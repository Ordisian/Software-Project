extends Control

@onready var fade: TextureRect = $Fade

func _ready() -> void:
	fade.size = get_viewport().get_visible_rect().size
	create_fade_out_tween()

func create_fade_out_tween() -> void:
	var fade_tween: Tween = create_tween()
	
	# Animate modulate to fully transparent
	fade_tween.tween_property(fade, "modulate", Color(1, 1, 1, 0), 1.0) \
		.set_ease(Tween.EASE_IN_OUT) \
		.set_delay(0.5)
	
	await fade_tween.finished
	$"..".visible = false
