/* eslint-disable max-len */

import * as React from 'react'

interface ITramIconProps {
  height: string
  withoutBox: boolean
}

const tramIcon: React.SFC<ITramIconProps> = (props) => {
    const icon = (
      <svg
        className='line-icon'
        version='1.1' id='Layer_1' x='0px' y='0px'
        viewBox='0 0 1024 1024' enableBackground='new 0 0 16 16' height={props.height}
      >
          <g>
              <path fill='rgb(255, 255, 255)' className='path1 fill-color14' d='M870.393 993.287h-716.811c-67.864 0-122.883-55.015-122.883-122.883v-716.811c0-67.864 55.015-122.883 122.883-122.883h716.811c67.864 0 122.883 55.015 122.883 122.883v716.811c0 67.868-55.015 122.883-122.883 122.883z'/>
              <path fill='rgb(0, 152, 95)' className='path2 fill-color5' d='M0.033 126.799c0-69.114 57.594-126.709 126.709-126.709h767.931c71.676 0 129.27 57.594 129.27 126.709v767.931c0 71.672-57.594 129.27-129.27 129.27h-767.931c-69.114 0-126.709-57.594-126.709-129.27v-767.931zM715.492 218.95c-6.398-15.36-15.357-23.037-30.717-26.877-55.033-14.078-94.713-19.197-145.909-20.476v-44.799h94.713c12.799 0 23.037-11.52 23.037-24.319 0-15.357-10.238-26.877-23.037-26.877h-240.618c-15.357 0-26.877 11.517-26.877 26.877 0 12.799 11.52 24.319 26.877 24.319h93.43v44.795c-52.475 1.279-94.713 6.398-145.909 20.476-17.918 5.119-26.877 11.517-34.557 26.877l-21.758 52.475c-6.398 15.357-6.398 37.115-6.398 53.754v460.76c0 23.037 15.357 37.115 38.397 40.955 69.114 14.078 129.27 19.197 195.823 19.197 63.995 0 125.43-5.119 197.102-19.197 21.758-3.84 38.397-17.918 38.397-40.955v-460.753c0-16.639-3.84-38.397-10.238-53.754l-21.758-52.479zM651.497 908.812v-38.397l-47.356 6.398v31.996h-183.024v-31.996l-47.356-6.398v38.397h-38.397c-14.078 0-23.037 11.517-23.037 23.037 0 16.639 8.959 26.877 23.037 26.877h354.527c11.52 0 24.319-10.238 24.319-26.877 0-11.517-12.799-23.037-24.319-23.037h-38.394zM323.846 711.706c0-17.918 12.799-31.996 29.435-31.996 17.918 0 30.717 14.078 30.717 31.996 0 16.639-12.799 28.156-30.717 28.156-16.636 0.004-29.435-11.517-29.435-28.156zM325.125 314.942h372.449v311.011c-48.635 14.078-117.75 23.037-185.585 23.037-66.553 0-135.668-10.238-186.864-23.037v-311.011zM646.378 711.706c0-17.918 11.52-31.996 28.156-31.996 17.918 0 31.996 14.078 31.996 31.996 0 16.639-14.078 28.156-31.996 28.156-16.636 0.004-28.156-11.517-28.156-28.156z'/>
          </g>
      </svg>
    )

    const iconWithoutBox = (
      <svg
        className='line-icon'
        version='1.1' id='Layer_1' x='0px' y='0px'
        viewBox='0 0 1024 1024' enableBackground='new 0 0 16 16' height={props.height}
      >
          <g>
              <path fill='#FFFFFF' className='path2 fill-color5' d='M773.086 227.057c7.42 17.81 11.871 43.039 11.871 62.33v534.271c0 26.711-19.291 43.039-44.524 47.49-83.106 16.325-154.341 22.26-228.545 22.26-77.174 0-146.924-5.935-227.064-22.26-26.714-4.454-44.524-20.779-44.524-47.49v-534.271c0-19.294 0-44.524 7.42-62.33l25.226-60.845c8.905-17.81 19.294-25.23 40.073-31.165 59.364-16.325 108.339-22.26 169.184-23.745v-51.944h-108.339c-17.81 0-31.165-13.359-31.165-28.199 0-17.81 13.355-31.165 31.165-31.165h279.004c14.84 0 26.714 13.355 26.714 31.165 0 14.84-11.874 28.199-26.714 28.199h-109.824v51.944c59.364 1.481 105.373 7.42 169.184 23.745 17.81 4.454 28.196 13.355 35.616 31.165l25.241 60.845zM718.173 966.128c13.359 0 28.203 13.355 28.203 26.711 0 19.294-14.84 31.165-28.203 31.165h-411.088c-16.325 0-26.714-11.874-26.714-31.165 0-13.355 10.39-26.711 26.714-26.711h44.524v-44.524l54.91 7.42v37.104h212.224v-37.1l54.914-7.42v44.524h44.517zM363.479 737.579c0-20.776-14.84-37.104-35.616-37.104-19.291 0-34.131 16.325-34.131 37.104 0 19.294 14.84 32.65 34.131 32.65 20.776 0 35.616-13.355 35.616-32.65zM295.21 638.145c59.364 14.84 139.504 26.714 216.678 26.714 78.655 0 158.795-10.39 215.19-26.714v-360.629h-431.867v360.629zM737.471 737.579c0-20.776-16.325-37.104-37.104-37.104-19.291 0-32.653 16.325-32.653 37.104 0 19.294 13.359 32.65 32.653 32.65 20.776 0 37.104-13.355 37.104-32.65z'/>
          </g>
      </svg>
    )

    return (props.withoutBox) ? iconWithoutBox : icon
}

export default tramIcon
