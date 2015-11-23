#include <node.h>
#include <v8.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <malloc.h>
#include <assert.h>

using namespace v8;

#include "okvtts.h"

#ifdef _DEBUG
#pragma comment (lib, "libokvtts-d.lib")
#else
#pragma comment (lib, "libokvtts.lib")
#endif

Handle<Value> OKVInitFun(const char* conf_path){
    int result = OKVInit(conf_path);
    return scope.Close(result);
}

Handle<Value> OKVUnInitFun(void){
    int result = OKVUnInit(void);
    return result;
}

Handle<Value> OKVSetLangModeFun(int lang_mode){
    int result = OKVSetLangMode(lang_mode);
    return scope.Close(result);
}

Handle<Value> OKVSetSpeedFun(int speed){
    int result = OKVSetSpeed(speed);
    return scope.Close(result);
}

Handle<Value> OKVSetVolumeFun(int volume){
    int result = OKVSetVolume(volume);
    return scope.Close(result);
}

Handle<Value> OKVPlayFun(const char* text){
    int result = OKVPlay(text);
    return scope.Close(result);
}

Handle<Value> OKVStopFun(){
    int result = OKVStop();
    return scope.Close(result);
}

void init(Handle<Object> target){
    NODE_SET_METHOD(target, "OKVInit", OKVInitFun);
    NODE_SET_METHOD(target, "OKVUnInit", OKVUnInitFun);
    NODE_SET_METHOD(target, "OKVSetLangMode", OKVSetLangModeFun);
    NODE_SET_METHOD(target, "OKVSetSpeed", OKVSetSpeedFun);
    NODE_SET_METHOD(target, "OKVSetVolume", OKVSetVolumeFun);
    NODE_SET_METHOD(target, "OKVPlay", OKVPlayFun);
    NODE_SET_METHOD(target, "OKVStop", OKVStopFun);
}

NODE_MODULE('libokvtts', init);

