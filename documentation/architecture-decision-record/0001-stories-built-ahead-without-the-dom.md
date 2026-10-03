# Stories are built ahead, without the DOM

A story's path is computed in full as timed ink before it plays, and building it touches no DOM; rendering reads any moment from that data. We chose this over drawing incrementally while playing forward because seeking, scrubbing backwards, the overview and the tests all need any moment on demand. State that only exists while playing forward breaks them.
