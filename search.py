import os
import glob
import re

audio_directory = './assets/audio'
output_file_path = './audioFiles.ts'

# Find all .mp3 files in the audio directory
audio_files = glob.glob(os.path.join(audio_directory, '*.mp3'))

# Extract numbers from filenames and sort files numerically
def extract_number(filename):
    match = re.search(r'(\d+)', filename)
    return int(match.group(1)) if match else -1

audio_files.sort(key=lambda x: extract_number(os.path.basename(x)))

# Create the import and mapping lines
imports = []
mappings = []

for index, file_path in enumerate(audio_files, start=1):
    file_name = os.path.basename(file_path)
    # Normalize the path and convert backslashes to forward slashes
    relative_path = os.path.relpath(file_path, os.path.dirname(output_file_path)).replace('\\', '/')
    # Prepend './' to ensure the path is relative
    normalized_path = f'./{relative_path}'
    variable_name = f'script{index}'
    imports.append(f"import {variable_name} from '{normalized_path}';")
    mappings.append(f"  {index}: {variable_name},")

# Create the new content
new_content = '\n'.join(imports) + '\n\nconst audioFiles = {\n' + '\n'.join(mappings) + '\n};\n\nexport default audioFiles;'

# Write the new content to audioFiles.ts
with open(output_file_path, 'w') as file:
    file.write(new_content)

print('audioFiles.ts has been updated successfully.')
