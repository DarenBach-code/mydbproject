      import Form from '@/components/Form'
      import Nav from '@/components/Nav'

      function Index() {
        return (
          <div>
            <Nav />
            <div className='grid grid-row-2 w-screen pt-8'>
              <h1 className='text-gray-200 text-4xl font-bold justify-self-center'>
                Welcome to our Movie Database Project!
              </h1>
              <Form />
            </div>
          </div>
        )
      }
      
      export default Index      
