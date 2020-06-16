FROM node

RUN cp /etc/apt/sources.list /etc/apt/sources.list.bak
RUN echo "">/etc/apt/sources.list 
RUN echo "deb http://mirrors.aliyun.com/ubuntu/ xenial main restricted universe multiverse">>/etc/apt/sources.list 
RUN echo "deb http://mirrors.aliyun.com/ubuntu/ xenial-security main restricted universe multiverse">>/etc/apt/sources.list 
RUN echo "deb http://mirrors.aliyun.com/ubuntu/ xenial-updates main restricted universe multiverse">>/etc/apt/sources.list 
RUN echo "deb http://mirrors.aliyun.com/ubuntu/ xenial-backports main restricted universe multiverse">>/etc/apt/sources.list

#7更新源
RUN apt-get -o Acquire::Check-Valid-Until=false update
#8安装ffmpeg
RUN apt-get -y --force-yes install yasm ffmpeg

COPY . /app
WORKDIR /app
RUN npm install --registry=https://registry.npm.taobao.org
RUN npm run compile
EXPOSE 3000
CMD npm run dev
