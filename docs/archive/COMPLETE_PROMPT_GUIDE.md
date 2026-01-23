# Complete Prompt Guide for Email Extension Installation

## You're Here: Region Selection

```
? Which option do you want enabled for this parameter?
❯ Multi-region (Europe - Belgium and Netherlands)
  [... other options ...]
  Hong Kong (asia-east2)  ← SCROLL DOWN TO THIS ONE
```

### How to Select asia-east2:
1. Press **DOWN arrow** key 15-20 times
2. Look for **"Hong Kong (asia-east2)"** with `❯` next to it
3. Press **ENTER**

---

## Prompt 2: Authentication Type

```
? Which option do you want enabled for this parameter?
❯ OAuth2
  Username & Password  ← SELECT THIS ONE
```

### How to Select Username & Password:
1. Press **DOWN arrow** once to move to "Username & Password"
2. Press **ENTER**

---

## Prompt 3: SMTP Connection URI

```
✔ Enter a value for SMTP connection URI:
_
```

### Answer:
**Just press ENTER** (leave it blank - we'll configure SMTP later)

---

## Prompt 4: Email Documents Collection

```
✔ Enter a value for Email documents collection:
_
```

### Answer:
1. Type: `mail`
2. Press **ENTER**

---

## Prompt 5: Default FROM Address

```
✔ Enter a value for Default FROM address:
_
```

### Answer:
1. Type: `noreply@onchainweb.app`
2. Press **ENTER**

---

## Prompt 6: Default REPLY-TO Address

```
✔ Enter a value for Default REPLY-TO address:
_
```

### Answer:
**Just press ENTER** (leave it blank - optional)

---

## Prompt 7: Users Collection

```
✔ Enter a value for Users collection:
_
```

### Answer:
1. Type: `users`
2. Press **ENTER**

---

## Prompt 8: Templates Collection

```
✔ Enter a value for Templates collection:
_
```

### Answer:
**Just press ENTER** (leave it blank - optional)

---

## Final Prompt: Proceed with Installation?

```
Do you want to proceed with installation?
(y/N)
```

### Answer:
1. Type: `y`
2. Press **ENTER**

---

## Then Wait...

Installation will take 3-5 minutes. You'll see:
```
i  extensions: installing extension ...
i  extensions: installing Cloud Function ...
i  extensions: installing secrets ...
✔  Finished installing extensions
```

---

## Verify Success

After installation, you should see something like:
```
✔ Finished installing extensions
✔ DONE
```

Then run:
```bash
firebase ext:list --project=onchainweb-37d30
```

You should see:
```
✅ firestore-send-email ........ ACTIVE
✅ storage-resize-images ....... ACTIVE
```

---

## Common Issues

### If you select wrong option:
- Press **UP/DOWN arrows** to move
- Press **ENTER** to confirm

### If you type wrong text:
- Press **CTRL+A** to select all
- Press **DELETE** to clear
- Type again

### If installation hangs:
- Press **CTRL+C** to cancel
- Wait 5 minutes
- Try again

---

**Ready? Go to your terminal and start with region selection!**

You've got this! 🚀
