# goals.gd

# This script handles functionality for the goals panel

extends PanelContainer

const TICK_0_5X = preload("res://Images/Ui/Prinbles_YetAnotherIcons (beta) (9_7_2023)/png@0.5x/White-Icon/Tick@0.5x.png")
const CROSS_0_5X = preload("res://Images/Ui/Prinbles_YetAnotherIcons (beta) (9_7_2023)/png@0.5x/White-Icon/Cross@0.5x.png")

## NewGoal Button
@onready var new_goal_button: TextureButton = %NewGoalButton
@onready var new_goal_touch: TouchScreenButton = %NewGoalTouch

## Pop-Up
@onready var new_goal_pop_up: ConfirmationDialog = $NewGoalPopUp
@onready var new_goal_input: LineEdit = $NewGoalPopUp/NewGoalInput

@onready var goals_container: VBoxContainer = %GoalsContainer

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	set_connections()

func set_connections() -> void:
	new_goal_touch.connect("pressed", Callable(self, "on_touch_area_pressed"))
	new_goal_button.connect("pressed", Callable(self, "on_touch_area_pressed"))
	new_goal_pop_up.connect("confirmed", Callable(self, "_on_goal_name_confirmed"))

# Show the pop-up when the touch area or button is pressed
func on_touch_area_pressed() -> void:
	new_goal_pop_up.popup_centered()
	new_goal_input.clear()

# When the goal name is confirmed, create a new goal
func _on_goal_name_confirmed() -> void:
	var goal_name = new_goal_input.text
	if goal_name.strip_edges() != "":  # Ensure the goal name is not empty
		add_goal(goal_name)
	new_goal_pop_up.hide()

# Add a new goal to the VBoxContainer
func add_goal(goal_name) -> void:
	# Create a new HBoxContainer for the goal
	var goal_hbox = HBoxContainer.new()
	goal_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	
	# Add a checkmark button to move to Finished category of buttons
	var check_button = TextureButton.new()
	check_button.texture_normal = TICK_0_5X
	check_button.connect("pressed", Callable(self, "on_check_button_pressed").bind(goal_hbox))
	goal_hbox.add_child(check_button)
	
	# Add a Label for the goal name
	var goal_label = Label.new()
	goal_label.text = str("  " + goal_name)
	goal_hbox.add_child(goal_label)
	
	# Add the goal to the VBoxContainer
	goals_container.add_child(goal_hbox)
	# Place the goal before the FinishedGoalsLabel
	goals_container.move_child(goal_hbox, %FinishedGoalsLabel.get_index())

# Move the goal to either finished for current
func on_check_button_pressed(goal_hbox: HBoxContainer) -> void:
	if goal_hbox.get_child(0).texture_normal == CROSS_0_5X:
		goal_hbox.get_child(0).texture_normal = TICK_0_5X
		goals_container.move_child(goal_hbox, %FinishedGoalsLabel.get_index())
		print("Moved goal to current goals container")
		
	elif goal_hbox.get_child(0).texture_normal == TICK_0_5X:
		goal_hbox.get_child(0).texture_normal = CROSS_0_5X
		goals_container.move_child(goal_hbox, %FinishedGoalsLabel.get_index() + 1)
		print("Moved goal to finished container")
