import { View, Text, Image, ScrollView } from 'react-native'
import { Video, ResizeMode } from 'expo-av'

import NLWLogo from '../src/assets/nlw-spacetime-logo.svg'
import Icon from '@expo/vector-icons/Feather'
import { Link, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'
import React, { useState, useEffect } from 'react'
import { api } from '../src/lib/api'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'

dayjs.locale(ptBr)

interface Memory {
  coverUrl: string
  excerpt: string
  isImage: boolean
  createdAt: string
  id: string
}
export default function Memories() {
  const { bottom, top } = useSafeAreaInsets()
  const [memories, setMemories] = useState<Memory[]>([])
  const router = useRouter()

  async function signOut() {
    await SecureStore.deleteItemAsync('token')
    router.push('/')
  }
  async function LoadMemories() {
    const token = await SecureStore.getItemAsync('token')
    const response = await api.get('/memories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const dataMemories = response.data.map((item) => {
      item.isImage = item.coverUrl.indexOf('jpg') !== -1
      return item
    })
    setMemories(dataMemories)
  }

  useEffect(() => {
    LoadMemories()
  }, [])

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-4 flex-row items-center justify-between px-8">
        <NLWLogo />
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={signOut}
            className="h-10 w-10 items-center justify-center rounded-full bg-red-500"
          >
            <Icon name="log-out" size={16} color="#000" />
          </TouchableOpacity>

          <Link href="/new" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View className="mt-6 space-y-10">
        {memories.map((memory) => {
          const { id, createdAt, isImage, coverUrl, excerpt } = memory
          return (
            <View className="space-y-4" key={id}>
              <View className="flex-row items-center gap-2">
                <View className="h-px w-5 bg-gray-50" />
                <Text className="font-body text-xs text-gray-100">
                  {dayjs(createdAt).format('D[ de ]MMMM[, ]YYYY')}
                </Text>
              </View>

              <View className="space-y-4 px-8">
                <>
                  {isImage ? (
                    <Image
                      source={{
                        uri: coverUrl,
                      }}
                      className="aspect-video w-full rounded-lg"
                      alt=""
                    />
                  ) : (
                    <Video
                      source={{
                        uri: coverUrl,
                      }}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      className="aspect-video w-full rounded-lg"
                      isLooping
                      isMuted={false}
                    />
                  )}
                </>
                <Text className="font-body text-base leading-relaxed text-gray-100">
                  {excerpt}
                </Text>
                <Link href={'/memories/id'} asChild>
                  <TouchableOpacity className="flex-row items-center gap-2">
                    <Text className="font-body text-sm text-gray-200">
                      Ler mais
                    </Text>
                    <Icon name="arrow-right" size={16} color="#9e9ea0" />
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}
