import json
import sys

# Đảm bảo in console tiếng Việt không bị lỗi
try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

def fix_mojibake_string(s):
    result = []
    bytes_acc = []
    for c in s:
        if ord(c) < 128:
            # Ký tự ASCII là ranh giới phân tách các cụm lỗi
            if bytes_acc:
                try:
                    result.append(bytes(bytes_acc).decode('utf-8'))
                except Exception:
                    result.append(bytes(bytes_acc).decode('cp1252', errors='replace'))
                bytes_acc = []
            result.append(c)
        else:
            try:
                # Thử mã hóa bằng cp1252
                b = c.encode('cp1252')
                bytes_acc.extend(b)
            except UnicodeEncodeError:
                # Ký tự tiếng Việt chuẩn không bị lỗi (nằm ngoài cp1252)
                if bytes_acc:
                    try:
                        result.append(bytes(bytes_acc).decode('utf-8'))
                    except Exception:
                        result.append(bytes(bytes_acc).decode('cp1252', errors='replace'))
                    bytes_acc = []
                result.append(c)
                
    # Giải quyết phần còn lại cuối chuỗi
    if bytes_acc:
        try:
            result.append(bytes(bytes_acc).decode('utf-8'))
        except Exception:
            result.append(bytes(bytes_acc).decode('cp1252', errors='replace'))
            
    return "".join(result)

def fix_json_structure(obj):
    if isinstance(obj, dict):
        return {key: fix_json_structure(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [fix_json_structure(item) for item in obj]
    elif isinstance(obj, str):
        return fix_mojibake_string(obj)
    return obj

def main():
    file_path = 'Facebook Chatbot Connector.json'
    print(f"Reading {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
        
    print("Fixing garbled strings recursively inside JSON...")
    fixed_data = fix_json_structure(data)
    
    print("Saving clean UTF-8 connector file...")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(fixed_data, f, ensure_ascii=False, indent=2)
        
    print("Successfully restored Vietnamese encoding!")

if __name__ == '__main__':
    main()
