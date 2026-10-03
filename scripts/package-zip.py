import os
import sys
import zipfile
from pathlib import Path

def create_zip():
    project_root = Path(__file__).resolve().parent.parent
    folder_name = project_root.name
    desktop = Path.home() / "Desktop"
    output_zip = desktop / f"{folder_name}.zip"

    exclude_dirs = {
        'node_modules', '.git', '.next', 'dist', 'build',
        '.wrangler', '.sites-runtime', '.vinext', '.agents', '.codex',
        '__pycache__', '.turbo', 'coverage'
    }
    exclude_exts = {'.zip', '.tar', '.gz', '.log'}

    print(f"Packaging {folder_name} for ChatGPT / distribution...")
    count = 0
    total_bytes = 0

    with zipfile.ZipFile(output_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(project_root):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in sorted(files):
                ext = Path(file).suffix.lower()
                if ext in exclude_exts:
                    continue
                file_path = Path(root) / file
                rel_path = file_path.relative_to(project_root)
                arcname = f"{folder_name}/{rel_path.as_posix()}"
                zipf.write(file_path, arcname)
                count += 1
                total_bytes += file_path.stat().st_size

    zip_size = output_zip.stat().st_size
    print("Archive created successfully!")
    print(f"  Target: {output_zip}")
    print(f"  Files included: {count}")
    print(f"  Uncompressed size: {total_bytes / (1024 * 1024):.2f} MB")
    print(f"  Compressed size: {zip_size / (1024 * 1024):.2f} MB")

if __name__ == '__main__':
    create_zip()
