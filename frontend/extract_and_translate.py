import os
import re
import json
import time
from deep_translator import GoogleTranslator

SRC_DIR = os.path.join(os.getcwd(), 'src')
LOCALES_DIR = os.path.join(SRC_DIR, 'locales')
AR_DIR = os.path.join(LOCALES_DIR, 'ar')
EN_DIR = os.path.join(LOCALES_DIR, 'en')

os.makedirs(AR_DIR, exist_ok=True)
os.makedirs(EN_DIR, exist_ok=True)

AR_JSON_PATH = os.path.join(AR_DIR, 'translation.json')
EN_JSON_PATH = os.path.join(EN_DIR, 'translation.json')

PATTERN = re.compile(r'i18n\.t\((["\'])(.*?)\1')

def load_existing(path):
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def extract_keys():
    keys = set()
    for root, _, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                matches = PATTERN.findall(content)
                for quote, text in matches:
                    try:
                        text_decoded = text.encode('utf-8').decode('unicode_escape')
                    except:
                        text_decoded = text
                    text_stripped = text_decoded.strip()
                    if text_stripped:
                        keys.add(text_stripped)
    return keys

def main():
    print("Extracting keys...")
    extracted_keys = extract_keys()
    print(f"Found {len(extracted_keys)} unique keys.")

    ar_dict = load_existing(AR_JSON_PATH)
    en_dict = load_existing(EN_JSON_PATH)

    cleaned_ar_dict = {}
    cleaned_en_dict = {}
    
    for k, v in ar_dict.items():
        try:
            dk = k.encode('utf-8').decode('unicode_escape') if '\\u' in k else k
            dv = v.encode('utf-8').decode('unicode_escape') if '\\u' in v else v
            cleaned_ar_dict[dk] = dv
        except:
            cleaned_ar_dict[k] = v

    for k, v in en_dict.items():
        try:
            dk = k.encode('utf-8').decode('unicode_escape') if '\\u' in k else k
            dv = v.encode('utf-8').decode('unicode_escape') if '\\u' in v else v
            cleaned_en_dict[dk] = dv
        except:
            cleaned_en_dict[k] = v

    translator = GoogleTranslator(source='ar', target='en')
    
    count = 0
    total = len(extracted_keys)

    for key in extracted_keys:
        count += 1
        new_key = False
        if key not in cleaned_ar_dict:
            cleaned_ar_dict[key] = key
            new_key = True
        
        # If the key is not in english dict OR if the English dictionary still contains arabic letters (untranslated previously)
        if key not in cleaned_en_dict or re.search(r'[\u0600-\u06FF]', cleaned_en_dict[key]):
            try:
                if re.search(r'[\u0600-\u06FF]', key):
                    translated = translator.translate(key)
                else:
                    translated = key
                    
                cleaned_en_dict[key] = translated
                new_key = True
                print(f"[{count}/{total}] Translated '{key}' -> '{translated}'")
                time.sleep(0.05)
            except Exception as e:
                print(f"Error translating '{key}': {e}")
                cleaned_en_dict[key] = key
        
        # Periodically save locally every 10 iterations or when new strings are translated
        if new_key and count % 10 == 0:
            save_json(AR_JSON_PATH, cleaned_ar_dict)
            save_json(EN_JSON_PATH, cleaned_en_dict)

    print("Saving dictionaries...")
    save_json(AR_JSON_PATH, cleaned_ar_dict)
    save_json(EN_JSON_PATH, cleaned_en_dict)
    print("Done!")

if __name__ == '__main__':
    main()
