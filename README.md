# 1. Bắt đầu dự án mới

## 1.1 Cài đặt môi trường

```sh
# Với yarn
$ yarn global add @vue/cli
$ yarn global add cordova
$ yarn install

# Với npm
$ npm i -g @vue/cli
$ npm i -g cordova
$ npm i
```

## 1.2 Tạo dự án

```sh
$ vue create <tên-dự-án> # Thư viện cần thiết: Babel, Vuex, Vue-router
$ cd <tên-dự-án>
$ vue add vuetify # Enter cho đến khi kết thúc
$ vue add vuetify-cordova
$ cordova prepare
```

# 2 Chạy

## 2.1 Môi trường phát triển (dev)

```sh
# Với yarn
$ yarn dev              # Chạy môi trường browser
$ yarn dev android      # Chạy môi trường android
$ yarn dev ios          # Chạy môi trường ios
# Với npm
$ npm run dev           # Chạy môi trường browser
$ npm run dev android   # Chạy môi trường android
$ npm run dev ios       # Chạy môi trường ios
```

## 2.1 Build app (production not release)

```sh
# Với yarn
$ yarn prod             # Build source cho môi trường browser
$ yarn prod android     # Build source cho môi trường android
$ yarn prod ios         # Build source cho môi trường ios
# Với npm
$ npm run prod          # Build source cho môi trường browser
$ npm run prod android  # Build source cho môi trường android
$ npm run prod ios      # Build source cho môi trường ios
```

## 2.1 Build app (release)

```sh
# Với yarn
$ yarn release             # Build source cho môi trường browser
$ yarn release android     # Build source cho môi trường android release
$ yarn release ios         # Build source cho môi trường ios release
# Với npm
$ npm run release          # Build source cho môi trường browser
$ npm run release android  # Build source cho môi trường android release
$ npm run release ios      # Build source cho môi trường ios release
```


<hr>

### License

MIT
