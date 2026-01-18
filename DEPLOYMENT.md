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

## Temizlik
## İşlem bittikten sonra 
## 1. Yerel (Local) Dalı Silmek
- git branch -d [dal-adi]
## 2. Uzak (Remote) Dalı Silmek:
- git push origin --delete xyz


## Budama (Pruning) Komutu
## Bu komut, uzak sunucuda (origin) artık mevcut olmayan tüm dalların yerelindeki referanslarını temizler:
git fetch origin --prune
## Kısaltılmış hali: 
git fetch -p