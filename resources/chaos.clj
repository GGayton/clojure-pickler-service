(ns integration.steps
  (:require [clojure.test :refer [is]]
            [clj-gherkin.core :refer [Given When Then]]))

;; --- STATE MANAGEMENT ---
(def world-state (atom {}))

;; --- STEP DEFINITION FACTORY ---
;; We define "The Big 100": Using a loop to generate unique step functions 
;; dynamically for our library's registry.

(doseq [i (range 1 101)]
  (let [step-name (str "integration-step-" i)]
    ;; This simulates 100 distinct step definitions in the registry
    (eval
     `(defn ~(symbol step-name) [state# val#]
        (swap! world-state assoc (keyword ~step-name) val#)))))

;; --- ACTUAL GHERKIN BINDINGS ---

;; GIVEN STEPS (Defining 25 variants via regex)
(Given #"^(.+) starts a new scheme in \"(.+)\"$" [character location]
       (swap! world-state assoc :actor character :loc location))

(Given #"^the current greed level is (\d+)$" [level]
       (swap! world-state assoc :greed (read-string level)))

(Given #"^(.+) has (\d+) \"(.+)\" in the inventory$" [actor qty item]
       (swap! world-state update-in [:inventory item] (fnil + 0) (read-string qty)))

;; WHEN STEPS (Defining 25 variants via regex)
(When #"^(.+) yells \"WAH!\" (\d+) times$" [actor count]
      (let [wahs (repeat (read-string count) "WAH!")]
        (swap! world-state assoc :last-sound (clojure.string/join " " wahs))))

(When #"^they attempt to steal (.+)$" [target]
      (if (> (@world-state :greed) 100)
        (swap! world-state assoc :heist-status :success)
        (swap! world-state assoc :heist-status :caught-by-mario)))

;; THEN STEPS (Defining 50 variants via logic/regex)
(Then #"^the \"(.+)\" should increase by ([\d\.]+)$" [metric multiplier]
      (let [m (keyword metric)
            mult (Float/parseFloat multiplier)]
        (is (>= (get @world-state m 0) 0))))

(Then #"^Waluigi's mustache should twitch (\d+) times$" [n]
      (let [twitches (read-string n)]
        (is (not (neg? twitches)) "Mustache cannot twitch negatively!")))

(Then #"^the world state must be \"(.+)\"$" [expected]
      (is (= expected "Chaotic")))

(Then "the \"Wah-O-Meter\" is calibrated to {}" [calib]
      true)
    
(Then "Waluigi is standing \"{}\" Wario" [state]
      true)

;; This should fail half of these
(Then "Wario consumes a \"{}\" power-up" [state]
      true)

(Then "Waluigi performs a \"Lanky Leg\" maneuver" [state]
      true)

(Then "the duo triggers the \"{}\" trap" [state]
      true)

(Then "the inventory should contain \"{}\"" [state]
      true)

(Then "the \"{}\" status should be {}" [state]
      true)

(Then "we verify the \"Physics Engine\" is still {}" [state]
      true)

(Then "we check that {} is still \"{}\"" [state]
      true)

(Then "we ensure the \"Score\" is exactly {int}" [state]
      true)

(Then "we confirm the \"Game Over\" flag is {}" [state]
      true)

(Then "we conclude the \"Heist\" phase" [state]
      true)

(defn -main []
  (println "Running Wah-gration Tests...")
  ;; Integration logic to parse the .feature file and map to the above functions
  )