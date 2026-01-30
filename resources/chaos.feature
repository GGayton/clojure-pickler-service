Feature: Wario and Waluigi's Chaotic Integration

  Scenario Outline: Massive scale chaos synchronization
    # Each scenario below executes 20 steps (5 Given, 5 When, 5 Then, 5 And)
    Given <character> starts a new scheme in "<location>"
    And the current greed level is <start_greed>
    And <character> has <item_count> "Gold Coins" in the inventory
    And the "Wah-O-Meter" is calibrated to <calibration>
    And Waluigi is standing "<position>" Wario
    
    When <character> yells "WAH!" <shout_count> times
    And <character> consumes a "Garlic" power-up
    And they attempt to steal <theft_target>
    And Waluigi performs a "Lanky Leg" maneuver
    And the duo triggers the "<trap_type>" trap
    
    Then the "Greed Index" should increase by <multiplier>
    And the inventory should contain "<loot>"
    And the world state must be "Chaotic"
    And Waluigi's mustache should twitch <twitch_count> times
    And the "Global Wah" status should be <status>
    
    And we verify the "Physics Engine" is still <physics_state>
    And we check that <character> is still "Purple"
    And we ensure the "Score" is exactly <final_score>
    And we confirm the "Game Over" flag is <game_state>
    And we conclude the "Heist" phase
    
    Examples:
      | character | location       | start_greed | item_count | calibration | position | shout_count | theft_target | trap_type | multiplier | loot           | twitch_count | status     | physics_state | final_score | game_state |
      | Wario     | Wario Castle   | 100         | 50         | 9.9         | behind   | 3           | The Crown    | Spike     | 1.5        | Diamond        | 12           | ACTIVE     | BROKEN        | 5000        | FALSE      |
      | Waluigi   | Tennis Court   | 50          | 10         | 1.2         | beside   | 10          | Trophy       | Net       | 2.0        | Silver Cup     | 40           | LOUD       | WOBBLY        | 1000        | FALSE      |
      | Wario     | Diamond City   | 200         | 999        | 5.5         | above    | 1           | Microgame    | Bob-omb   | 5.0        | High Score     | 5            | CRITICAL   | GLITCHY       | 99999       | TRUE       |
      | Waluigi   | Pinball Track  | 75          | 25         | 0.0         | below    | 5           | Pinball      | Flippers  | 1.1        | Extra Ball     | 100          | VIBRATING  | FAST          | 2500        | FALSE      |
      | Wario     | Mario's House  | 500         | 0          | 10.0        | inside   | 2           | Spaghetti    | Fire Flower| 0.5       | Empty Plate    | 1            | ANGRY      | MELTING       | 0           | TRUE       |
      | Waluigi   | Battle Stadium | 10          | 5          | 4.4         | near     | 7           | Power Star   | Lightning | 10.0       | Victory        | 22           | GLORIOUS   | UNSTABLE      | 8888        | FALSE      |
      | Wario     | Garlic Farm    | 999         | 100        | 8.8         | under    | 0           | Harvest      | Hoe       | 1.2        | Super Garlic   | 3            | SMELLY     | SMELLY        | 400         | FALSE      |
      | Waluigi   | The Void       | 0           | 0          | -1.0        | nowhere  | 99          | Reality      | Paradox   | 0.0        | Nothingness    | 999          | SILENT     | NULL          | -1          | TRUE       |
      | Wario     | Treasure Ship  | 300         | 500        | 7.7         | atop     | 4           | Anchor       | Kraken    | 3.3        | Sunken Gold    | 15           | DROWNING   | FLUID         | 12000       | FALSE      |
      | Waluigi   | Kart Circuit   | 80          | 3          | 2.2         | drifting | 6           | First Place  | Blue Shell| 1.5        | Banana Peel    | 8            | SWIFT      | SLIPPERY      | 150         | FALSE      |

    Examples:
      | location     | character   | start_greed | item_count | calibration | position | shout_count | theft_target | trap_type | multiplier | loot           | twitch_count | status     | physics_state | final_score | game_state |
      | Wario Castle | Wario       | 100         | 50         | 9.9         | behind   | 3           | The Crown    | Spike     | 1.5        | Diamond        | 12           | ACTIVE     | BROKEN        | 5000        | FALSE      |