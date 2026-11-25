@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 goto python
py -3 "AION\preview.py"
goto done
:python
python "AION\preview.py"
:done
if errorlevel 1 pause
