# UTM links for social posts

Every link we post to social uses one of these, so analytics can tell which platform and which kind of post sent people to yuigui.com. Google Analytics (already on every page) reads the tags on its own. A waitlist signup also stores the tags it arrived with, in the `note` column of `yui_waitlist`.

Rules:

- `utm_source`: the platform, lowercase: `x`, `instagram`, `threads`, `tiktok`, `youtube`, `bluesky`, `linkedin`, `reddit`, `discord`, `hn`, `producthunt`, `github`.
- `utm_medium`: `social` for a post, `bio` for the profile link, `community` for a forum or Discord reply.
- `utm_campaign`: what the post is about: `build-log`, `weekly-update`, `testflight`, `open-source`, `launch`.
- `utm_content` (optional): one short slug for the post, like `yui7-relay`, when two posts in one campaign need telling apart.
- Link to the page the post is about. A post about a ship links its progress entry, not the home page.
- Never tag links inside the site, the repo README or email to people we know. Only public posts.

## Profile links (bio)

| Account | Link |
| --- | --- |
| X | https://www.yuigui.com/?utm_source=x&utm_medium=bio&utm_campaign=profile |
| Instagram | https://www.yuigui.com/?utm_source=instagram&utm_medium=bio&utm_campaign=profile |
| Threads | https://www.yuigui.com/?utm_source=threads&utm_medium=bio&utm_campaign=profile |
| TikTok | https://www.yuigui.com/?utm_source=tiktok&utm_medium=bio&utm_campaign=profile |
| YouTube | https://www.yuigui.com/?utm_source=youtube&utm_medium=bio&utm_campaign=profile |
| Bluesky | https://www.yuigui.com/?utm_source=bluesky&utm_medium=bio&utm_campaign=profile |
| LinkedIn | https://www.yuigui.com/?utm_source=linkedin&utm_medium=bio&utm_campaign=profile |

## Posts, ready to paste (swap the source for the platform)

| What the post is about | Link |
| --- | --- |
| A ship from the build log | https://www.yuigui.com/progress?utm_source=x&utm_medium=social&utm_campaign=build-log |
| The Friday weekly update | https://www.yuigui.com/progress?utm_source=x&utm_medium=social&utm_campaign=weekly-update |
| The public beta | https://www.yuigui.com/?utm_source=x&utm_medium=social&utm_campaign=testflight |
| Open source, contributors wanted | https://www.yuigui.com/?utm_source=x&utm_medium=social&utm_campaign=open-source |
| A new TestFlight build | https://www.yuigui.com/changelog?utm_source=x&utm_medium=social&utm_campaign=build-log |
| Yui Lines, the screen language | https://www.yuigui.com/yl?utm_source=x&utm_medium=social&utm_campaign=open-source |
| Try the playground | https://www.yuigui.com/playground?utm_source=x&utm_medium=social&utm_campaign=open-source |
| Hermes Discord reply | https://www.yuigui.com/?utm_source=discord&utm_medium=community&utm_campaign=open-source |

Links straight to GitHub stay untagged: GitHub drops the tags, and its own traffic page shows referrers. Send people to yuigui.com first when you can; every page there links the repo and the beta.
