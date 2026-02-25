{
  "name": "NewAnimator",
  "entryState": "Idle",
  "states": [
    {
      "name": "Idle",
      "animationAsset": "Assets/PNG/Idle, run, jump/ild.cea",
      "speed": 12,
      "position": {
        "x": 17,
        "y": 145
      },
      "animationClip": "Assets/PNG/principal.cea",
      "endFrame": 9,
      "startFrame": 1,
      "flipY": false
    },
    {
      "name": "correr",
      "animationClip": "Assets/PNG/correr.cea",
      "speed": 12,
      "position": {
        "x": 52,
        "y": 43
      },
      "startFrame": 1,
      "endFrame": 8
    },
    {
      "name": "corre",
      "animationClip": "Assets/PNG/correr.cea",
      "speed": 12,
      "position": {
        "x": 27,
        "y": 238
      },
      "flipX": true,
      "flipY": false,
      "startFrame": 1,
      "endFrame": 8
    }
  ],
  "transitions": [
    {
      "from": "Idle",
      "to": "correr",
      "hasExitTime": true,
      "conditions": []
    },
    {
      "from": "correr",
      "to": "Idle",
      "hasExitTime": true,
      "conditions": []
    },
    {
      "from": "Idle",
      "to": "corre",
      "hasExitTime": true,
      "conditions": []
    },
    {
      "from": "corre",
      "to": "Idle",
      "hasExitTime": true,
      "conditions": []
    }
  ],
  "movementMapping": {
    "1": "Arriba",
    "3": "corre",
    "4": "Idle",
    "5": "correr",
    "7": "Abajo"
  },
  "smartMode": true
}