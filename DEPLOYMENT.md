# Git Deployment Süreç Dokümanı

## 1. Development Push
git status
git add .
git commit -m "Mesajınız"
git push origin development

## 2. Test Merge İşlemi
git checkout test
git pull origin test
git merge development
# Vim uyarısı için: ESC + :wq + Enter
git push origin test

## 3. Production (Canlı) Yayına Alma
git checkout production
git pull origin production
git merge test
git push origin production