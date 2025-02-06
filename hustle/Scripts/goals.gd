
# goals.gd

# This script handles functionality for the goals panel

extends PanelContainer

## NewGoal Button
@onready var new_goal_button: TextureButton = %NewGoalButton
@onready var new_goal_touch: TouchScreenButton = %NewGoalTouch

## Pop-Up
@onready var new_goal_pop_up: ConfirmationDialog = $NewGoalPopUp
@onready var new_goal_input: LineEdit = $NewGoalPopUp/NewGoalInput

@onready var goals_container: VBoxContainer = $VBoxContainer/MarginContainer/GoalsContainer

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	new_goal_touch.connect("pressed", Callable(self, "on_touch_area_pressed"))
	new_goal_pop_up.connect("confirmed", Callable(self, "_on_goal_name_confirmed"))

func on_touch_area_pressed():
	new_goal_pop_up.popup_centered()
	new_goal_input.clear()

# When the goal name is confirmed, create a new goal
func _on_goal_name_confirmed():
	var goal_name = new_goal_input.text
	if goal_name.strip_edges() != "":  # Ensure the goal name is not empty
		add_goal(goal_name)
	new_goal_pop_up.hide()

# Add a new goal to the VBoxContainer
func add_goal(goal_name):
	# Create a new HBoxContainer for the goal
	var goal_hbox = HBoxContainer.new()
	
	# Add a CheckButton for toggling completion
	var completion_button = CheckButton.new()
	completion_button.text = str(goal_name + "  completed : ")
	goal_hbox.add_child(completion_button)
	
	# Add the goal to the VBoxContainer
	goals_container.add_child(goal_hbox)
	goal_hbox.owner = goals_container
