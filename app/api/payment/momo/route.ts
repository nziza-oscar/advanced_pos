import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '@/lib/database/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the incoming callback for debugging (useful for MTN MoMo APIs)
    console.log('MoMo Payment Callback Received:', body);

    // This is where you'd typically handle the MTN MoMo payment status update
    // The specific logic depends on whether this is a "Collection" or "Disbursement"
    // const { externalId, status, amount } = body;

    // if (externalId) {
    //   const transaction = await Transaction.findOne({
    //     where: { id: externalId }
    //   });

    //   if (transaction) {
    //     if (status === 'SUCCESSFUL') {
    //       await transaction.update({ status: 'completed' });
    //     } else if (status === 'FAILED') {
    //       await transaction.update({ status: 'failed' });
    //     }
    //   }
    // }

    return NextResponse.json({ 
      success: true, 
      message: 'Callback processed' 
    });

  } catch (error: any) {
    console.error('MoMo Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// MoMo often requires a GET or OPTIONS check during setup
export async function GET() {
  return NextResponse.json({ 
    status: 'MoMo API endpoint active',
    integration: 'MTN Rwanda'
  });
}