# Rerank experiment: results

50 queries over 10862 films. Bi-encoder `BAAI/bge-small-en-v1.5`, cross-encoder `cross-encoder/ms-marco-MiniLM-L-6-v2`, rerank depth 30. Single deterministic run on CPU.

| Metric | Baseline (cosine) | Rerank (top-30 + cross-encoder) |
|---|---|---|
| Top-1 accuracy | 0.36 (18/50) | 0.80 (40/50) |
| Top-2 accuracy | 0.50 (25/50) | 0.82 (41/50) |
| Top-5 accuracy | 0.66 (33/50) | 0.86 (43/50) |
| MRR@30 | 0.484 | 0.822 |
| Recall@30 (candidate pool) | 0.86 | same pool |
| Mean latency per query | 19.2 ms (embed + search) | +1323.4 ms rerank = 1342.6 ms total |

## Top-1 changes (paired, per query)

- Improved (baseline wrong, rerank right): 24
- Worsened (baseline right, rerank wrong): 2
- Unchanged, both right: 16
- Unchanged, both wrong: 8
- Exact McNemar test, two-sided p = 1e-05
- Top-1 difference (rerank - baseline) = +0.44, paired bootstrap 95% CI [+0.28, +0.60]

Rank movement for the 43 queries whose target was in the top 30: better 25, worse 2, same 16 (sign test p = 5.6e-06).

## Per query

| Target film | Baseline rank | Rerank rank | Baseline top-1 | Rerank top-1 |
|---|---|---|---|---|
| Failure to Launch | 5 | 1 | Jeff, Who Lives at Home | Failure to Launch |
| The Wild Bunch | 65 | >30 | American Outlaws | Tough Guys |
| Ice Princess | 1 | 1 | Ice Princess | Ice Princess |
| Land of the Dead | 1 | 4 | Land of the Dead | Rise of the Zombies |
| Stalingrad | 1 | 2 | Stalingrad | Ð¡Ñ‚Ð°Ð»Ð¸Ð½Ð³Ñ€Ð°Ð´ |
| Broken Arrow | 2 | 1 | 2001: A Space Travesty | Broken Arrow |
| Severance | 26 | 1 | The Hunted | Severance |
| American Gigolo | 5 | 1 | The Escort | American Gigolo |
| The Sessions | 28 | 1 | Romance & Cigarettes | The Sessions |
| You Only Live Twice | 41 | >30 | The Fourth Protocol | Ice Station Zebra |
| When Harry Met Sally... | 2 | 1 | If These Walls Could Talk 2 | When Harry Met Sally... |
| Black Rain | 24 | 1 | Across 110th Street | Black Rain |
| Thirteen | 11 | 1 | 2.0:37 | Thirteen |
| Regarding Henry | 1 | 1 | Regarding Henry | Regarding Henry |
| The Conversation | 1 | 1 | The Conversation | The Conversation |
| The Man Without a Face | 13 | 1 | Deadly Friend | The Man Without a Face |
| Grown Ups 2 | 2 | 1 | Friends with Kids | Grown Ups 2 |
| Terms of Endearment | 2 | 1 | The Astronaut's Wife | Terms of Endearment |
| Draft Day | 1 | 1 | Draft Day | Draft Day |
| Drumline | 1 | 1 | Drumline | Drumline |
| Brokeback Mountain | 25 | 1 | The Misfits | Brokeback Mountain |
| Clueless | 1 | 1 | Clueless | Clueless |
| A.C.O.D. | 5 | 1 | Life as a House | A.C.O.D. |
| The Swan Princess: The Mystery of the Enchanted Kingdom | 1 | 1 | The Swan Princess: The Mystery of the Enchanted Kingdom | The Swan Princess: The Mystery of the Enchanted Kingdom |
| Arn: Tempelriddaren | 1 | 1 | Arn: Tempelriddaren | Arn: Tempelriddaren |
| Red Dragon | 22 | 3 | Mindhunters | Blood Work |
| Earth | 2 | 1 | Life | Earth |
| According to Greta | 1 | 1 | According to Greta | According to Greta |
| Boogie Nights | 1 | 1 | Boogie Nights | Boogie Nights |
| Frankie and Johnny | 9 | 1 | Diner | Frankie and Johnny |
| The Animatrix | 4 | 1 | ã‚¢ãƒƒãƒ—ãƒ«ã‚·ãƒ¼ãƒ‰ | The Animatrix |
| Indecent Proposal | 1 | 1 | Indecent Proposal | Indecent Proposal |
| La Rafle | 4 | 1 | Faubourg 36 | La Rafle |
| She's Out of My League | 9 | 1 | Unlawful Entry | She's Out of My League |
| New York, I Love You | 36 | >30 | New York Stories | Loosies |
| A Few Good Men | 3 | 1 | In Harm's Way | A Few Good Men |
| The Book of Life | 71 | >30 | The Neverending Story III: Escape from Fantasia | Great Expectations |
| The Hitcher | 1 | 1 | The Hitcher | The Hitcher |
| Star Trek Into Darkness | 39 | >30 | Star Trek: The Motion Picture | Starship Troopers: Invasion |
| Eastern Promises | 1 | 1 | Eastern Promises | Eastern Promises |
| Beverly Hills Chihuahua | 3 | 1 | All Dogs Go to Heaven | Beverly Hills Chihuahua |
| Doodlebug | 1 | 1 | Doodlebug | Doodlebug |
| Spawn | 338 | >30 | Assassins | Point of No Return |
| Stomp the Yard | 2 | 1 | Step Up 2: The Streets | Stomp the Yard |
| Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb | 1 | 1 | Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb | Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb |
| Aladdin and the King of Thieves | 11 | 1 | Madagascar: Escape 2 Africa | Aladdin and the King of Thieves |
| The Love Bug | 84 | >30 | The Car | Top Gear: The Perfect Road Trip |
| The General's Daughter | 1 | 1 | The General's Daughter | The General's Daughter |
| Hollywood Homicide | 2 | 1 | Lakeview Terrace | Hollywood Homicide |
| The Legend of Bagger Vance | 4 | 1 | Tin Cup | The Legend of Bagger Vance |

Environment: Python 3.10.11, torch 2.14.1+cpu (12 threads), sentence-transformers 6.3.0, Windows-10-10.0.26200-SP0, Intel64 Family 6 Model 186 Stepping 2, GenuineIntel.
