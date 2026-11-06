@echo off
setlocal
if exist "%~dp0..\..\..\apache-maven-3.9.9\bin\mvn.cmd" (
    call "%~dp0..\..\..\apache-maven-3.9.9\bin\mvn.cmd" %*
) else (
    call mvn %*
)
endlocal
